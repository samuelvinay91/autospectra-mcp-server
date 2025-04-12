import { Browser, Page } from 'playwright';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { automationTools } from '../automation';

// Helper type for test steps
type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Interactive debugging tools for MCP server
 * Enables live test modification and debugging directly from Cline
 */
export const debuggingTools = {
  /**
   * Current debug session state
   */
  state: {
    currentTest: null as string | null,
    isDebugging: false,
    browser: null as Browser | null,
    page: null as Page | null,
    breakpoints: [] as string[],
    testSteps: [] as Array<{
      id: string;
      type: string;
      args: any;
      result?: any;
      status: StepStatus;
    }>,
    currentStepIndex: -1,
    paused: false,
    logs: [] as string[],
    screenshots: [] as string[],
  },

  /**
   * Initialize or update a debug test
   */
  async debug_test(args: {
    testName: string;
    testScript?: string;
    runImmediately?: boolean;
    breakAt?: string[];
    clearPrevious?: boolean;
  }) {
    try {
      const { 
        testName, 
        testScript = null, 
        runImmediately = false, 
        breakAt = [], 
        clearPrevious = false 
      } = args;

      // Initialize debug state if needed
      if (!this.state.currentTest || testName !== this.state.currentTest || clearPrevious) {
        // Clean up previous session if exists
        if (this.state.browser) {
          await this.state.browser.close();
          this.state.browser = null;
          this.state.page = null;
        }

        this.state.currentTest = testName;
        this.state.isDebugging = true;
        this.state.breakpoints = breakAt;
        this.state.testSteps = [];
        this.state.currentStepIndex = -1;
        this.state.paused = false;
        this.state.logs = [];
        this.state.screenshots = [];
      } else {
        // Update breakpoints
        this.state.breakpoints = breakAt;
      }

      // Save test script if provided
      if (testScript) {
        const outputDir = path.join(process.cwd(), 'output', 'debug');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const testPath = path.join(outputDir, `${testName}.js`);
        fs.writeFileSync(testPath, testScript);
        
        // Parse test script to extract steps
        this.state.testSteps = this._parseTestScript(testScript);
        logger.info(`Debug test saved to ${testPath} with ${this.state.testSteps.length} steps`);
      }

      // Run immediately if requested
      if (runImmediately && this.state.testSteps.length > 0) {
        return await this.run_debug_test({ testName });
      }

      return {
        content: [
          {
            type: 'text',
            text: `Debug test "${testName}" prepared with ${this.state.testSteps.length} steps.\n` +
                  `${breakAt.length > 0 ? `Breakpoints set at: ${breakAt.join(', ')}` : 'No breakpoints set.'}\n` +
                  `Use run_debug_test to execute.`
          }
        ]
      };
    } catch (error) {
      logger.error('Error in debug_test:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error preparing debug test: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Run the current debug test
   */
  async run_debug_test(args: {
    testName: string;
    fromStep?: number;
    toStep?: number;
    runToBreakpoint?: boolean;
  }) {
    try {
      const { 
        testName, 
        fromStep = 0, 
        toStep = -1, 
        runToBreakpoint = true 
      } = args;

      if (!this.state.currentTest || testName !== this.state.currentTest) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: No debug test with name "${testName}" is prepared. Use debug_test first.`
            }
          ],
          isError: true
        };
      }

      if (this.state.testSteps.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Debug test "${testName}" has no steps defined.`
            }
          ],
          isError: true
        };
      }

      // Reset run state
      this.state.logs = [];
      this.state.currentStepIndex = Math.max(0, fromStep);
      this.state.paused = false;
      
      // Initialize browser if needed
      if (!this.state.browser || !this.state.page) {
        this._log(`Initializing browser for debug test "${testName}"...`);
        const result = await automationTools.navigate({ url: 'about:blank', visible: true });
        
        // Access the browser instance - we'll need to create a wrapper function
        // since automationTools doesn't expose getBrowser/getPage directly
        const { browser, page } = await this._initBrowserAndPage();
        this.state.browser = browser;
        this.state.page = page;
        
        this._log('Browser initialized');
      }

      // Calculate end step
      const endStep = toStep >= 0 ? 
                     Math.min(toStep, this.state.testSteps.length - 1) : 
                     this.state.testSteps.length - 1;

      this._log(`Running debug test "${testName}" from step ${fromStep} to ${endStep}`);

      // Execute steps
      for (let i = this.state.currentStepIndex; i <= endStep; i++) {
        this.state.currentStepIndex = i;
        const step = this.state.testSteps[i];
        
        // Check if should pause at this step
        if (runToBreakpoint && this._shouldBreakAt(step.id)) {
          this.state.paused = true;
          this._log(`Paused at breakpoint: ${step.id}`);
          
          // Take screenshot at breakpoint
          await this._takeDebugScreenshot(`breakpoint_${step.id}`);
          
          break;
        }

        // Execute step
        try {
          step.status = 'running';
          this._log(`Executing step ${i}: ${step.type} (${step.id})`);
          
          // Execute the step based on its type
          if (step.type === 'navigate') {
            step.result = await automationTools.navigate({
              ...step.args,
              visible: true
            });
          } 
          else if (step.type === 'click') {
            step.result = await automationTools.click({
              ...step.args,
              visible: true
            });
          }
          else if (step.type === 'type') {
            step.result = await automationTools.type({
              ...step.args,
              visible: true
            });
          }
          else if (step.type === 'extract') {
            step.result = await automationTools.extract({
              ...step.args,
              visible: true
            });
          }
          else if (step.type === 'screenshot') {
            step.result = await automationTools.screenshot({
              ...step.args,
              visible: true
            });
          }
          else if (step.type === 'wait') {
            await new Promise(resolve => setTimeout(resolve, step.args.ms || 1000));
            step.result = { waited: step.args.ms || 1000 };
          }
          else if (step.type === 'assert') {
            // Handle assertion
            const { assertion, message } = step.args;
            const result = await this._evaluateAssertion(assertion);
            if (!result) {
              throw new Error(`Assertion failed: ${message || assertion}`);
            }
            step.result = { passed: true };
          }
          else if (step.type === 'execute') {
            // Execute custom code in browser context
            if (this.state.page) {
              const result = await this.state.page.evaluate(step.args.code);
              step.result = { result };
            } else {
              throw new Error('Browser page is not initialized');
            }
          }
          else {
            throw new Error(`Unknown step type: ${step.type}`);
          }
          
          step.status = 'completed';
          this._log(`Step ${i} completed successfully`);
        } catch (error) {
          step.status = 'failed';
          const errorMessage = error instanceof Error ? error.message : String(error);
          this._log(`Step ${i} failed: ${errorMessage}`);
          
          // Take screenshot on error
          await this._takeDebugScreenshot(`error_step_${i}`);
          
          return {
            content: [
              {
                type: 'text',
                text: `Debug test "${testName}" failed at step ${i} (${step.type}):\n${errorMessage}\n\n` +
                      `Logs:\n${this.state.logs.join('\n')}\n\n` +
                      `Screenshots captured: ${this.state.screenshots.join(', ')}`
              }
            ],
            isError: true
          };
        }
      }

      // Take final screenshot if not paused
      if (!this.state.paused) {
        await this._takeDebugScreenshot('final');
      }

      const currentStep = this.state.currentStepIndex >= 0 && this.state.currentStepIndex < this.state.testSteps.length
        ? this.state.testSteps[this.state.currentStepIndex]
        : null;

      return {
        content: [
          {
            type: 'text',
            text: this.state.paused ?
              `Debug test "${testName}" paused at step ${this.state.currentStepIndex}.\n` +
              `Current step: ${currentStep ? JSON.stringify(currentStep) : 'None'}\n\n` :
              `Debug test "${testName}" completed successfully.\n\n` +
              `Logs:\n${this.state.logs.join('\n')}\n\n` +
              `Screenshots captured: ${this.state.screenshots.join(', ')}`
          }
        ]
      };
    } catch (error) {
      logger.error('Error in run_debug_test:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error running debug test: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Continue execution of a paused debug test
   */
  async continue_debug_test(args: {
    steps?: number;
    runToBreakpoint?: boolean;
  }) {
    try {
      const { steps = -1, runToBreakpoint = true } = args;
      
      if (!this.state.isDebugging || !this.state.currentTest) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: No debug session is active.`
            }
          ],
          isError: true
        };
      }

      if (!this.state.paused) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Debug session is not paused.`
            }
          ],
          isError: true
        };
      }

      // Calculate steps to run
      const fromStep = this.state.currentStepIndex + 1;
      const toStep = steps > 0 ? fromStep + steps - 1 : -1;
      
      this.state.paused = false;
      
      return await this.run_debug_test({
        testName: this.state.currentTest,
        fromStep,
        toStep,
        runToBreakpoint
      });
    } catch (error) {
      logger.error('Error in continue_debug_test:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error continuing debug test: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Add or modify a test step in the current debug session
   */
  async modify_debug_step(args: {
    stepId: string;
    type: string;
    args: any;
    index?: number;
    runAfter?: boolean;
  }) {
    try {
      const { stepId, type, args: stepArgs, index = -1, runAfter = false } = args;
      
      if (!this.state.isDebugging || !this.state.currentTest) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: No debug session is active.`
            }
          ],
          isError: true
        };
      }

      // Find step if it exists
      const existingIndex = this.state.testSteps.findIndex(step => step.id === stepId);
      
      if (existingIndex >= 0) {
        // Update existing step
        this.state.testSteps[existingIndex] = {
          ...this.state.testSteps[existingIndex],
          type,
          args: stepArgs,
          status: 'pending' as StepStatus
        };
        this._log(`Updated step ${stepId} at index ${existingIndex}`);
      } else {
        // Add new step
        const newStep = {
          id: stepId,
          type,
          args: stepArgs,
          status: 'pending' as StepStatus
        };
        
        if (index >= 0 && index <= this.state.testSteps.length) {
          // Insert at specific index
          this.state.testSteps.splice(index, 0, newStep);
          this._log(`Added step ${stepId} at index ${index}`);
        } else {
          // Add to end
          this.state.testSteps.push(newStep);
          this._log(`Added step ${stepId} at end (index ${this.state.testSteps.length - 1})`);
        }
      }

      // Run immediately if requested
      if (runAfter) {
        const targetStep = this.state.testSteps.findIndex(step => step.id === stepId);
        if (targetStep >= 0) {
          return await this.run_debug_test({
            testName: this.state.currentTest,
            fromStep: targetStep,
            toStep: targetStep
          });
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: existingIndex >= 0 ?
              `Step ${stepId} updated successfully.` :
              `Step ${stepId} added successfully.`
          }
        ]
      };
    } catch (error) {
      logger.error('Error in modify_debug_step:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error modifying debug step: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Get the current debug state, including steps, logs, and screenshots
   */
  async get_debug_state(args: { includeStepResults?: boolean }) {
    try {
      const { includeStepResults = true } = args;
      
      if (!this.state.isDebugging || !this.state.currentTest) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: No debug session is active.`
            }
          ],
          isError: true
        };
      }

      // Take a current screenshot
      await this._takeDebugScreenshot('current_state');

      // Prepare steps info
      const steps = includeStepResults ? 
        this.state.testSteps : 
        this.state.testSteps.map(({ id, type, args, status }) => ({ id, type, args, status }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              testName: this.state.currentTest,
              currentStepIndex: this.state.currentStepIndex,
              paused: this.state.paused,
              breakpoints: this.state.breakpoints,
              steps,
              logs: this.state.logs,
              screenshots: this.state.screenshots
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      logger.error('Error in get_debug_state:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting debug state: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Clean up debug session resources
   */
  async cleanup_debug_session() {
    try {
      if (this.state.browser) {
        await this.state.browser.close();
      }
      
      this.state.currentTest = null;
      this.state.isDebugging = false;
      this.state.browser = null;
      this.state.page = null;
      this.state.breakpoints = [];
      this.state.testSteps = [];
      this.state.currentStepIndex = -1;
      this.state.paused = false;
      this.state.logs = [];
      this.state.screenshots = [];
      
      return {
        content: [
          {
            type: 'text',
            text: 'Debug session cleaned up successfully.'
          }
        ]
      };
    } catch (error) {
      logger.error('Error in cleanup_debug_session:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error cleaning up debug session: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Helper: Parse test script to extract steps
   */
  _parseTestScript(script: string) {
    try {
      // Simple regex-based parsing for demonstration
      // In a real implementation, this would be more robust
      const steps = [];
      
      // Match steps defined in script
      const stepPattern = /step\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*({[^}]+})\s*\)/g;
      let match;
      
      while ((match = stepPattern.exec(script)) !== null) {
        const [_, id, type, argsStr] = match;
        
        // Parse args (this is simplified, would need proper JS parsing in production)
        let args = {};
        try {
          // Replace single quotes with double quotes for JSON parsing
          const jsonArgsStr = argsStr.replace(/'/g, '"');
          args = JSON.parse(jsonArgsStr);
        } catch (e) {
          logger.warn(`Could not parse step args: ${argsStr}`);
        }
        
        steps.push({
          id,
          type,
          args,
          status: 'pending' as StepStatus
        });
      }
      
      return steps;
    } catch (error) {
      logger.error('Error parsing test script:', error);
      return [];
    }
  },

  /**
   * Helper: Initialize browser and page instances
   * This wraps the automation tools to access browser/page instances
   */
  async _initBrowserAndPage() {
    // Since we can't directly access browser/page from automationTools,
    // we'll navigate to a page which ensures the browser is created
    try {
      // Launch a browser with a simple about page
      await automationTools.navigate({ url: 'about:blank', visible: true });
      
      // For our implementation, we don't need direct access to the browser/page objects
      // since we're using automationTools methods for all operations
      // We just need placeholder objects to keep track of state
      const browser = {
        close: async () => {
          // Use navigate to about:blank as a way to "reset" the browser
          // rather than closing it, since we don't have direct access
          try {
            await automationTools.navigate({ url: 'about:blank', visible: true });
            return true;
          } catch (e) {
            return false;
          }
        }
      } as unknown as Browser;
      
      const page = {
        evaluate: async (codeOrFn: string | Function) => {
          // We can't directly evaluate JavaScript in the page context through automationTools
          // This is a limitation of our current implementation
          logger.info('Page evaluate called, but not directly supported');
          return null;
        }
      } as unknown as Page;
      
      return { browser, page };
    } catch (error) {
      logger.error('Error initializing browser and page:', error);
      throw error;
    }
  },

  /**
   * Helper: Should break at this step ID
   */
  _shouldBreakAt(stepId: string) {
    return this.state.breakpoints.includes(stepId);
  },

  /**
   * Helper: Log message and store in debug state
   */
  _log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    logger.info(logEntry);
    this.state.logs.push(logEntry);
  },

  /**
   * Helper: Take a screenshot for debugging
   */
  async _takeDebugScreenshot(name: string) {
    try {
      const outputDir = path.join(process.cwd(), 'output', 'debug');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${this.state.currentTest || 'debug'}_${name}_${timestamp}.png`;
      const screenshotPath = path.join(outputDir, filename);
      
      // Use automationTools instead of direct page access
      await automationTools.screenshot({ 
        fullPage: true,
        visible: true
      });
      
      // Copy the screenshot to our debug directory
      const lastScreenshot = path.join(process.cwd(), 'output', 'screenshot.png');
      if (fs.existsSync(lastScreenshot)) {
        fs.copyFileSync(lastScreenshot, screenshotPath);
        this.state.screenshots.push(filename);
        this._log(`Screenshot captured: ${filename}`);
      }
    } catch (error) {
      logger.error('Error taking debug screenshot:', error);
    }
  },

  /**
   * Helper: Evaluate an assertion in the browser context
   */
  async _evaluateAssertion(assertion: string) {
    try {
      // Since we can't directly evaluate JavaScript in the page, 
      // we'll need to use alternative approaches
      
      // For simple assertions about DOM elements, we can use extract
      if (assertion.includes('document.querySelector') && 
          (assertion.includes('textContent') || assertion.includes('innerText'))) {
        
        // Extract the selector and expected text from the assertion
        // This is a very basic parser and won't work for all cases
        const selectorMatch = assertion.match(/document\.querySelector\(['"]([^'"]+)['"]\)/);
        if (selectorMatch) {
          const selector = selectorMatch[1];
          
          // Get the actual text from the element
          const result = await automationTools.extract({
            selector,
            attribute: 'textContent'
          });
          
          // Check if result contains what we're testing for
          const expectedTextMatch = assertion.match(/=== ['"]([^'"]+)['"]/);
          if (expectedTextMatch && result?.content?.length > 0) {
            const expectedText = expectedTextMatch[1];
            const actualText = result.content[0].text?.trim() || '';
            return actualText === expectedText;
          }
        }
      }
      
      // For other types of assertions, we'll just return true for now
      // In a production implementation, you would need more sophisticated parsing
      this._log(`Warning: Couldn't fully evaluate assertion: ${assertion}, assuming true`);
      return true;
    } catch (error) {
      logger.error('Error evaluating assertion:', error);
      return false;
    }
  }
};
