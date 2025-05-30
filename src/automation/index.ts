import { browserManager } from './browserManager';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { config } from '../utils/config';
import { accessibilityTesting } from './accessibilityTesting';
import { apiTesting } from './apiTesting';

/**
 * Automation tools for browser interaction
 */
export const automationTools = {
  /**
   * Navigate to a URL
   */
  async navigate(args: { url: string, visible?: boolean }) {
    try {
      const { url, visible = false } = args;
      
      // Force a visible browser if requested
      if (visible) {
        await browserManager.closeBrowser(); // Close any existing browser
        
        // Log the current headless setting
        console.log('[DEBUG] Current headless setting:', config.headless);
        console.log('[DEBUG] Environment HEADLESS:', process.env.HEADLESS);
        
        // Force headless to false in a way that cannot be overridden
        process.env.HEADLESS = 'false';
        Object.defineProperty(config, 'headless', {
          configurable: true,
          get: function() { return false; }
        });
        
        // Get a new browser with forced settings
        const browser = await browserManager.getBrowser('chromium');
        
        // Log confirmation
        console.log('[INFO] Forcing visible browser mode - HEADLESS is now:', config.headless);
      }
      logger.info(`Navigating to: ${url}`);
      
      const page = await browserManager.getPage();
      // Increase timeout and use 'load' instead of 'domcontentloaded' for more complete page loading
      await page.goto(url, { 
        waitUntil: 'load', 
        timeout: 60000  // Increase timeout to 60 seconds
      });
      
      // Take a screenshot after navigation
      const screenshotBuffer = await page.screenshot({ fullPage: false });
      const screenshotPath = path.join(config.outputDir, 'navigation.png');
      fs.writeFileSync(screenshotPath, screenshotBuffer);
      
      return {
        content: [
          { 
            type: 'text', 
            text: `Successfully navigated to ${url}` 
          },
          { 
            type: 'image', 
            data: screenshotBuffer.toString('base64'),
            mimeType: 'image/png'
          }
        ]
      };
    } catch (error) {
      logger.error('Navigation error:', error);
      return {
        content: [
          { type: 'text', text: `Error navigating to URL: ${error}` }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Click on an element
   */
  async click(args: { selector: string, visible?: boolean }) {
    try {
      const { selector, visible = false } = args;
      
      // Force a visible browser if requested
      if (visible) {
        // Force headless to false in a way that cannot be overridden
        process.env.HEADLESS = 'false';
        Object.defineProperty(config, 'headless', {
          configurable: true,
          get: function() { return false; }
        });
        
        console.log('[INFO] Forcing visible browser mode for click operation');
      }
      logger.info(`Clicking element: ${selector}`);
      
      const page = await browserManager.getPage();
      
      // Use self-healing selector strategy
      const element = await browserManager.findElement(page, selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      // Scroll element into view and click
      await element.scrollIntoViewIfNeeded();
      await element.click();
      
      // Take a screenshot after click
      const screenshotBuffer = await page.screenshot();
      const screenshotPath = path.join(config.outputDir, 'click.png');
      fs.writeFileSync(screenshotPath, screenshotBuffer);
      
      return {
        content: [
          { 
            type: 'text', 
            text: `Successfully clicked element: ${selector}` 
          },
          { 
            type: 'image', 
            data: screenshotBuffer.toString('base64'),
            mimeType: 'image/png'
          }
        ]
      };
    } catch (error) {
      logger.error('Click error:', error);
      return {
        content: [
          { type: 'text', text: `Error clicking element: ${error}` }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Type text into an input field
   */
  async type(args: { selector: string; text: string; clearFirst?: boolean; visible?: boolean }) {
    try {
      const { selector, text, clearFirst = false, visible = false } = args;
      
      // Force a visible browser if requested
      if (visible) {
        // Force headless to false in a way that cannot be overridden
        process.env.HEADLESS = 'false';
        Object.defineProperty(config, 'headless', {
          configurable: true,
          get: function() { return false; }
        });
        
        console.log('[INFO] Forcing visible browser mode for typing operation');
      }
      logger.info(`Typing "${text}" into element: ${selector}`);
      
      const page = await browserManager.getPage();
      
      // Use self-healing selector strategy
      const element = await browserManager.findElement(page, selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      // Clear the field if requested
      if (clearFirst) {
        await element.fill('');
      }
      
      // Type the text
      await element.type(text);
      
      // Take a screenshot after typing
      const screenshotBuffer = await page.screenshot();
      const screenshotPath = path.join(config.outputDir, 'type.png');
      fs.writeFileSync(screenshotPath, screenshotBuffer);
      
      return {
        content: [
          { 
            type: 'text', 
            text: `Successfully typed "${text}" into element: ${selector}` 
          },
          { 
            type: 'image', 
            data: screenshotBuffer.toString('base64'),
            mimeType: 'image/png'
          }
        ]
      };
    } catch (error) {
      logger.error('Type error:', error);
      return {
        content: [
          { type: 'text', text: `Error typing text: ${error}` }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Extract data from an element
   */
  async extract(args: { selector: string; attribute?: string; visible?: boolean }) {
    try {
      const { selector, attribute = 'textContent', visible = false } = args;
      
      // Force a visible browser if requested
      if (visible) {
        // Force headless to false in a way that cannot be overridden
        process.env.HEADLESS = 'false';
        Object.defineProperty(config, 'headless', {
          configurable: true,
          get: function() { return false; }
        });
        
        console.log('[INFO] Forcing visible browser mode for extraction operation');
      }
      logger.info(`Extracting ${attribute} from element: ${selector}`);
      
      const page = await browserManager.getPage();
      
      // Use self-healing selector strategy
      const element = await browserManager.findElement(page, selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      // Extract the requested attribute or property
      let value;
      if (attribute === 'textContent') {
        value = await element.textContent();
      } else if (attribute === 'innerHTML') {
        value = await element.innerHTML();
      } else {
        value = await element.getAttribute(attribute);
      }
      
      // Add a highlight method to the element if needed
      if (!element.highlight) {
        element.highlight = async () => {
          await page.evaluate((el) => {
            const originalStyle = el.getAttribute('style') || '';
            el.setAttribute('style', `${originalStyle}; border: 3px solid red !important; background-color: rgba(255, 0, 0, 0.2) !important;`);
            setTimeout(() => {
              el.setAttribute('style', originalStyle);
            }, 2000);
          }, element);
        };
      }
      
      // Take a screenshot with the element highlighted
      await element.highlight();
      const screenshotBuffer = await page.screenshot();
      const screenshotPath = path.join(config.outputDir, 'extract.png');
      fs.writeFileSync(screenshotPath, screenshotBuffer);
      
      return {
        content: [
          { 
            type: 'text', 
            text: `Successfully extracted ${attribute} from element: ${selector}\nValue: ${value}` 
          },
          { 
            type: 'image', 
            data: screenshotBuffer.toString('base64'),
            mimeType: 'image/png'
          }
        ]
      };
    } catch (error) {
      logger.error('Extract error:', error);
      return {
        content: [
          { type: 'text', text: `Error extracting data: ${error}` }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Take a screenshot
   */
  async screenshot(args: { fullPage?: boolean, visible?: boolean } = {}) {
    try {
      const { fullPage = false, visible = false } = args;
      
      // Force a visible browser if requested
      if (visible) {
        // Ensure the browser is visible regardless of config
        Object.defineProperty(config, 'headless', {
          get: function() { return false; }
        });
        console.log('[INFO] Forcing visible browser mode for screenshot');
      }
      logger.info(`Taking ${fullPage ? 'full page' : 'viewport'} screenshot`);
      
      const page = await browserManager.getPage();
      const screenshotBuffer = await page.screenshot({ fullPage });
      const screenshotPath = path.join(config.outputDir, 'screenshot.png');
      fs.writeFileSync(screenshotPath, screenshotBuffer);
      
      return {
        content: [
          { 
            type: 'text', 
            text: `Screenshot captured successfully` 
          },
          { 
            type: 'image', 
            data: screenshotBuffer.toString('base64'),
            mimeType: 'image/png'
          }
        ]
      };
    } catch (error) {
      logger.error('Screenshot error:', error);
      return {
        content: [
          { type: 'text', text: `Error taking screenshot: ${error}` }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Run accessibility tests on the current page
   */
  async checkAccessibility(args: { 
    rules?: string[],
    includeHidden?: boolean,
    visible?: boolean
  } = {}) {
    try {
      const { rules, includeHidden = false, visible = false } = args;
      
      // Force a visible browser if requested
      if (visible) {
        // Force headless to false in a way that cannot be overridden
        process.env.HEADLESS = 'false';
        Object.defineProperty(config, 'headless', {
          configurable: true,
          get: function() { return false; }
        });
        
        console.log('[INFO] Forcing visible browser mode for accessibility testing');
      }
      
      logger.info('Running accessibility tests on current page');
      
      const page = await browserManager.getPage();
      
      // Run accessibility tests
      const results = await accessibilityTesting.runAccessibilityTests(page, {
        rules,
        includeHidden,
        outputFormat: 'json'
      });
      
      // Create a summary of the results
      const violationCount = results.violations?.length || 0;
      const passCount = results.passes?.length || 0;
      const incompleteCount = results.incomplete?.length || 0;
      
      let summary = `Accessibility Test Results:\n`;
      summary += `- ${violationCount} violations found\n`;
      summary += `- ${passCount} tests passed\n`;
      summary += `- ${incompleteCount} tests need review\n\n`;
      
      if (violationCount > 0) {
        summary += `Top violations:\n`;
        
        // Include details for up to 5 violations
        const topViolations = results.violations.slice(0, 5);
        topViolations.forEach((violation: any, index: number) => {
          summary += `${index + 1}. ${violation.description} (impact: ${violation.impact})\n`;
          summary += `   - WCAG: ${violation.tags.filter((tag: string) => tag.startsWith('wcag')).join(', ')}\n`;
          summary += `   - Affects ${violation.nodes.length} element(s)\n`;
        });
      }
      
      // Include a screenshot if violations were found and highlighted
      const content: any[] = [
        { 
          type: 'text', 
          text: summary
        }
      ];
      
      // If we have a screenshot of violations, include it
      try {
        const screenshotPath = path.join(config.outputDir, 'accessibility-violations.png');
        if (fs.existsSync(screenshotPath)) {
          const screenshotBuffer = fs.readFileSync(screenshotPath);
          content.push({
            type: 'image',
            data: screenshotBuffer.toString('base64'),
            mimeType: 'image/png'
          });
        }
      } catch (error) {
        logger.error('Error loading accessibility screenshot:', error);
      }
      
      return {
        content
      };
    } catch (error) {
      logger.error('Accessibility testing error:', error);
      return {
        content: [
          { type: 'text', text: `Error running accessibility tests: ${error}` }
        ],
        isError: true
      };
    }
  },

  /**
   * Make an HTTP request to an API endpoint
   */
  async apiRequest(args: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    data?: any;
    params?: Record<string, string>;
    auth?: {
      username?: string;
      password?: string;
      token?: string;
      type?: 'basic' | 'bearer' | 'none';
    };
    validateStatus?: boolean;
    timeout?: number;
    baseURL?: string;
    ignoreHTTPSErrors?: boolean;
  }) {
    return await apiTesting.apiRequest(args);
  },

  /**
   * Validate an API response against a schema
   */
  async validateSchema(args: {
    response: any;
    schema: any;
    schemaPath?: string;
  }) {
    return await apiTesting.validateSchema(args);
  },

  /**
   * Create a mock API endpoint for testing
   */
  async createMock(args: {
    endpoint: string;
    method: string;
    response: any;
    statusCode?: number;
  }) {
    return await apiTesting.createMock(args);
  },

  /**
   * Make a GraphQL request
   */
  async graphqlRequest(args: {
    endpoint: string;
    query: string;
    variables?: Record<string, any>;
    headers?: Record<string, string>;
    auth?: {
      username?: string;
      password?: string;
      token?: string;
      type?: 'basic' | 'bearer' | 'none';
    };
  }) {
    return await apiTesting.graphqlRequest(args);
  }
};
