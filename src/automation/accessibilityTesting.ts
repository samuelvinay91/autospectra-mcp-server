import { Page } from 'playwright';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { config } from '../utils/config';

/**
 * Accessibility testing tools
 */
export const accessibilityTesting = {
  /**
   * Run accessibility tests on the current page
   */
  async runAccessibilityTests(page: Page, options: { 
    rules?: string[],
    outputFormat?: 'json' | 'html' | 'text',
    includeHidden?: boolean
  } = {}): Promise<{
    violations: any[],
    passes: any[],
    incomplete: any[],
    inapplicable: any[]
  }> {
    try {
      logger.info('Running accessibility tests');
      
      // Inject axe-core if not already present
      const axeInjected = await page.evaluate(() => {
        return typeof (window as any).axe !== 'undefined';
      });
      
      if (!axeInjected) {
        // Inject axe-core from CDN for the test
        await page.addScriptTag({
          url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js'
        });
      }
      
      // Configure and run axe
      const results = await page.evaluate((options) => {
        return new Promise<any>((resolve) => {
          const axeOptions: any = {
            runOnly: options.rules ? { type: 'tag', values: options.rules } : undefined,
            resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],
            elementRef: true,
            reporter: options.outputFormat === 'html' ? 'html' : 'v2',
          };
          
          if (options.includeHidden !== undefined) {
            axeOptions.rules = {
              ...axeOptions.rules,
              'hidden-content': { enabled: options.includeHidden }
            };
          }
          
          (window as any).axe.run(document, axeOptions)
            .then((results: any) => resolve(results))
            .catch((err: Error) => resolve({ error: err.toString() }));
        });
      }, options);
      
      // Generate report
      const reportPath = path.join(config.outputDir, 'accessibility-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      
      logger.info(`Accessibility report saved to ${reportPath}`);
      logger.info(`Found ${results.violations?.length || 0} accessibility violations`);
      
      // Take a screenshot highlighting issues
      if (results.violations && results.violations.length > 0) {
        // Highlight elements with violations
        await page.evaluate((violations: any[]) => {
          // Create a style element for our highlights
          const style = document.createElement('style');
          style.id = 'axe-violation-styles';
          style.innerHTML = `
            .axe-violation-marker {
              border: 3px solid #f00 !important;
              background-color: rgba(255, 0, 0, 0.1) !important;
              position: relative;
            }
            .axe-violation-marker::before {
              content: attr(data-axe-violation);
              position: absolute;
              top: -25px;
              left: 0;
              background: #f00;
              color: #fff;
              padding: 2px 5px;
              font-size: 12px;
              white-space: nowrap;
              z-index: 9999;
            }
          `;
          document.head.appendChild(style);
          
          // Highlight each element with a violation
          violations.forEach((violation: any, violationIndex: number) => {
            violation.nodes.forEach((node: any, nodeIndex: number) => {
              const selector = node.target[0];
              const elements = document.querySelectorAll(selector);
              
              elements.forEach((element: Element) => {
                element.classList.add('axe-violation-marker');
                element.setAttribute('data-axe-violation', `Issue ${violationIndex + 1}.${nodeIndex + 1}: ${violation.description}`);
              });
            });
          });
        }, results.violations);
        
        // Take a screenshot of the highlighted page
        const screenshotBuffer = await page.screenshot();
        const screenshotPath = path.join(config.outputDir, 'accessibility-violations.png');
        fs.writeFileSync(screenshotPath, screenshotBuffer);
        
        logger.info(`Accessibility violations screenshot saved to ${screenshotPath}`);
        
        // Remove the highlighting
        await page.evaluate(() => {
          const style = document.getElementById('axe-violation-styles');
          if (style) style.remove();
          
          document.querySelectorAll('.axe-violation-marker').forEach(element => {
            element.classList.remove('axe-violation-marker');
            element.removeAttribute('data-axe-violation');
          });
        });
      }
      
      return results;
    } catch (error) {
      logger.error('Accessibility testing error:', error);
      return {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: []
      };
    }
  }
};
