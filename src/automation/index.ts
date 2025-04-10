import { browserManager } from './browserManager';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { config } from '../utils/config';
import { accessibilityTesting } from './accessibilityTesting';

/**
 * Automation tools for browser interaction
 */
export const automationTools = {
  /**
   * Navigate to a URL
   */
  async navigate(args: { url: string }) {
    try {
      const { url } = args;
      logger.info(`Navigating to: ${url}`);
      
      const page = await browserManager.getPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
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
  async click(args: { selector: string }) {
    try {
      const { selector } = args;
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
  async type(args: { selector: string; text: string; clearFirst?: boolean }) {
    try {
      const { selector, text, clearFirst = false } = args;
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
  async extract(args: { selector: string; attribute?: string }) {
    try {
      const { selector, attribute = 'textContent' } = args;
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
  async screenshot(args: { fullPage?: boolean } = {}) {
    try {
      const { fullPage = false } = args;
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
    includeHidden?: boolean
  } = {}) {
    try {
      const { rules, includeHidden = false } = args;
      
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
  }
};
