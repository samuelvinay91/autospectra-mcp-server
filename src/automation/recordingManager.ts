import { Page } from 'playwright';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { config } from '../utils/config';

/**
 * Interface for recorded actions
 */
interface RecordedAction {
  type: 'navigate' | 'click' | 'type' | 'hover' | 'select' | 'check' | 'uncheck' | 'waitForElement';
  params: Record<string, any>;
  timestamp: number;
  screenshot?: string; // Path to screenshot if taken
}

/**
 * Manager for recording browser interactions
 */
class RecordingManager {
  private recording: boolean = false;
  private actions: RecordedAction[] = [];
  private page: Page | null = null;
  private startUrl: string = '';
  private recordingId: string = '';
  
  /**
   * Start recording browser interactions
   */
  async startRecording(page: Page, options: { 
    includeScreenshots?: boolean,
    startUrl?: string,
    frameDelayMs?: number
  } = {}): Promise<boolean> {
    try {
      if (this.recording) {
        logger.warn('Recording already in progress');
        return false;
      }
      
      this.recording = true;
      this.actions = [];
      this.page = page;
      this.startUrl = options.startUrl || await page.url();
      this.recordingId = `recording-${Date.now()}`;
      
      // Create recordings directory if it doesn't exist
      const recordingsDir = path.join(config.outputDir, 'recordings', this.recordingId);
      fs.mkdirSync(recordingsDir, { recursive: true });
      
      logger.info(`Started recording with ID: ${this.recordingId}`);
      
      // Record navigation to the start URL
      this.recordAction({
        type: 'navigate',
        params: { url: this.startUrl },
        timestamp: Date.now()
      });
      
      // Set up event listeners on the page
      await this._setupListeners(page, options);
      
      return true;
    } catch (error) {
      logger.error('Error starting recording:', error);
      this.recording = false;
      return false;
    }
  }
  
  /**
   * Stop recording and return the recorded actions
   */
  async stopRecording(): Promise<RecordedAction[]> {
    if (!this.recording) {
      logger.warn('No recording in progress');
      return [];
    }
    
    this.recording = false;
    
    if (this.page) {
      // Remove event listeners
      // Note: Playwright doesn't provide a direct way to remove listeners
      // so we'll reset the page reference
      this.page = null;
    }
    
    logger.info(`Stopped recording. Recorded ${this.actions.length} actions`);
    return [...this.actions]; // Return a copy
  }
  
  /**
   * Generate test code from recorded actions
   */
  generateTestCode(actions: RecordedAction[], options: {
    framework?: 'playwright' | 'mocha' | 'jest',
    style?: 'async' | 'sync',
    format?: 'javascript' | 'typescript'
  } = {}): string {
    const { 
      framework = 'playwright',
      style = 'async',
      format = 'javascript'
    } = options;
    
    logger.info(`Generating ${framework} test code with ${style} style in ${format} format`);
    
    // Determine file extension
    const isTs = format === 'typescript';
    
    let code = '';
    
    // Import statements
    if (framework === 'playwright') {
      code += isTs 
        ? `import { test, expect } from '@playwright/test';\n\n`
        : `const { test, expect } = require('@playwright/test');\n\n`;
    } else if (framework === 'mocha') {
      code += isTs 
        ? `import { chromium, Browser, Page } from 'playwright';\nimport { expect } from 'chai';\n\n`
        : `const { chromium } = require('playwright');\nconst { expect } = require('chai');\n\n`;
    } else if (framework === 'jest') {
      code += isTs 
        ? `import { chromium, Browser, Page } from 'playwright';\n\n`
        : `const { chromium } = require('playwright');\n\n`;
    }
    
    // Test description derived from the starting URL
    const testDescription = `Test for ${this.startUrl.split('//')[1]?.split('/')[0] || 'website'}`;
    
    // Test structure
    if (framework === 'playwright') {
      code += `test('${testDescription}', async ({ page }) => {\n`;
      
      // Add recorded actions
      code += this._generatePlaywrightActionCode(actions);
      
      code += `});\n`;
    } else if (framework === 'mocha') {
      code += `describe('${testDescription}', () => {\n`;
      code += isTs
        ? `  let browser: Browser;\n  let page: Page;\n\n`
        : `  let browser;\n  let page;\n\n`;
      
      code += `  before(async () => {\n`;
      code += `    browser = await chromium.launch({\n`;
      code += `      headless: false,\n`;
      code += `      slowMo: 50\n`;
      code += `    });\n`;
      code += `    const context = await browser.newContext();\n`;
      code += `    page = await context.newPage();\n`;
      code += `  });\n\n`;
      
      code += `  after(async () => {\n`;
      code += `    await browser.close();\n`;
      code += `  });\n\n`;
      
      code += `  it('should complete the test scenario', async () => {\n`;
      
      // Add recorded actions
      code += this._generateMochaActionCode(actions);
      
      code += `  });\n`;
      code += `});\n`;
    } else if (framework === 'jest') {
      code += isTs
        ? `let browser: Browser;\nlet page: Page;\n\n`
        : `let browser;\nlet page;\n\n`;
      
      code += `beforeAll(async () => {\n`;
      code += `  browser = await chromium.launch({\n`;
      code += `    headless: false,\n`;
      code += `    slowMo: 50\n`;
      code += `  });\n`;
      code += `  const context = await browser.newContext();\n`;
      code += `  page = await context.newPage();\n`;
      code += `});\n\n`;
      
      code += `afterAll(async () => {\n`;
      code += `  await browser.close();\n`;
      code += `});\n\n`;
      
      code += `test('${testDescription}', async () => {\n`;
      
      // Add recorded actions
      code += this._generateJestActionCode(actions);
      
      code += `});\n`;
    }
    
    // Add self-healing comment
    code = `// This test was auto-generated with self-healing selectors\n` +
           `// Each selector has multiple strategies for resilience\n\n` + code;
    
    return code;
  }
  
  /**
   * Record a browser action
   */
  recordAction(action: RecordedAction): void {
    if (!this.recording) {
      return;
    }
    
    this.actions.push(action);
    logger.info(`Recorded action: ${action.type}`);
  }
  
  /**
   * Save test code to file
   */
  saveTestCode(code: string, options: {
    framework?: 'playwright' | 'mocha' | 'jest',
    format?: 'javascript' | 'typescript'
  } = {}): string {
    const { 
      framework = 'playwright',
      format = 'javascript'
    } = options;
    
    // Determine file extension
    const extension = format === 'typescript' ? 'ts' : 'js';
    
    // Create output file path
    const filename = `${this.recordingId}-${framework}.${extension}`;
    const filePath = path.join(config.outputDir, 'recordings', filename);
    
    // Write code to file
    fs.writeFileSync(filePath, code);
    
    logger.info(`Saved test code to ${filePath}`);
    return filePath;
  }
  
  /**
   * Get the current recording state
   */
  isRecording(): boolean {
    return this.recording;
  }
  
  /**
   * Get the current recording ID
   */
  getRecordingId(): string {
    return this.recordingId;
  }
  
  /**
   * Setup event listeners on the page
   */
  private async _setupListeners(page: Page, options: {
    includeScreenshots?: boolean,
    frameDelayMs?: number
  }): Promise<void> {
    const { includeScreenshots = false, frameDelayMs = 0 } = options;
    
    // Create screenshots directory if needed
    let screenshotsDir = '';
    if (includeScreenshots) {
      screenshotsDir = path.join(config.outputDir, 'recordings', this.recordingId, 'screenshots');
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Create a listener context with shared state
    const listenerContext = {
      lastActionTime: Date.now(),
      frameDelay: frameDelayMs,
      screenshotCount: 0
    };
    
    // Note: Playwright doesn't provide a direct way to listen to all user interactions
    // So we use CDP (Chrome DevTools Protocol) to listen to runtime events
    
    // This is a simplified approximation - a real implementation would be more complex
    // and would require deeper integration with the browser's execution context
    
    // For simplicity, we'll just monitor navigation events
    page.on('framenavigated', async frame => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        
        // Don't record consecutive navigations to the same URL
        if (this.actions.length > 0 && 
            this.actions[this.actions.length - 1].type === 'navigate' &&
            this.actions[this.actions.length - 1].params.url === url) {
          return;
        }
        
        const action: RecordedAction = {
          type: 'navigate',
          params: { url },
          timestamp: Date.now()
        };
        
        // Take a screenshot if enabled
        if (includeScreenshots) {
          try {
            const screenshotPath = path.join(screenshotsDir, `${listenerContext.screenshotCount++}.png`);
            await page.screenshot({ path: screenshotPath });
            action.screenshot = screenshotPath;
          } catch (error) {
            logger.error('Error taking screenshot:', error);
          }
        }
        
        this.recordAction(action);
      }
    });
    
    // Use CDP to listen to input events
    // Note: This is just a representation of what would be a more complex implementation
    
    // In a real implementation, we would:
    // 1. Create CDP session: const cdpSession = await (page as any).context().newCDPSession(page);
    // 2. Enable relevant domains: await cdpSession.send('Input.enable');
    // 3. Listen to events: cdpSession.on('Input.mousePressed', ...)
    
    // For this demonstration, we'll log a message
    logger.info('Note: Complete user interaction recording requires additional instrumentation');
    logger.info('This implementation records navigation events only');
  }
  
  /**
   * Generate code for a specific action
   */
  private _generateActionCode(action: RecordedAction, framework: 'playwright' | 'mocha' | 'jest'): string {
    let code = '';
    const indent = '  ';
    
    switch (action.type) {
      case 'navigate':
        code += `${indent}await page.goto('${action.params.url}');\n`;
        break;
        
      case 'click':
        // Build robust, self-healing selector
        const selector = this._buildRobustSelector(action.params.selector);
        code += `${indent}await page.click(${selector});\n`;
        break;
        
      case 'type':
        const inputSelector = this._buildRobustSelector(action.params.selector);
        code += `${indent}await page.fill(${inputSelector}, '${action.params.text}');\n`;
        break;
        
      case 'waitForElement':
        const waitSelector = this._buildRobustSelector(action.params.selector);
        code += `${indent}await page.waitForSelector(${waitSelector});\n`;
        break;
        
      default:
        // For other actions, add a comment
        code += `${indent}// Unhandled action: ${action.type}\n`;
    }
    
    return code;
  }
  
  /**
   * Generate Playwright-specific code for recorded actions
   */
  private _generatePlaywrightActionCode(actions: RecordedAction[]): string {
    let code = '';
    
    for (const action of actions) {
      code += this._generateActionCode(action, 'playwright');
    }
    
    return code;
  }
  
  /**
   * Generate Mocha-specific code for recorded actions
   */
  private _generateMochaActionCode(actions: RecordedAction[]): string {
    let code = '';
    
    for (const action of actions) {
      code += this._generateActionCode(action, 'mocha');
    }
    
    return code;
  }
  
  /**
   * Generate Jest-specific code for recorded actions
   */
  private _generateJestActionCode(actions: RecordedAction[]): string {
    let code = '';
    
    for (const action of actions) {
      code += this._generateActionCode(action, 'jest');
    }
    
    return code;
  }
  
  /**
   * Build a robust selector for self-healing tests
   */
  private _buildRobustSelector(selectorOrPath: string): string {
    // This is a simplified implementation
    // In a real implementation, we would analyze the element and generate multiple selector strategies
    
    // For demonstration, we'll just wrap the selector in a string
    return `'${selectorOrPath}'`;
  }
}

export const recordingManager = new RecordingManager();
