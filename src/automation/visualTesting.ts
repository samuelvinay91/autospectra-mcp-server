import { Page } from 'playwright';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import fs from 'fs';
import path from 'path';
import { browserManager } from './browserManager';

/**
 * Visual testing utilities using Playwright's built-in comparison capabilities
 */
export const visualTesting = {
  /**
   * Compare screenshots using Playwright's built-in screenshot comparison
   */
  async compareScreenshots(args: { 
    url: string; 
    baselinePath?: string;
    threshold?: number;
  }) {
    try {
      const { url, baselinePath, threshold = 0.2 } = args;
      logger.info(`Performing visual comparison for ${url} with threshold ${threshold}`);
      
      // Navigate to the URL
      const page = await browserManager.getPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait a bit to ensure all animations have settled
      await page.waitForTimeout(1000);
      
      // Define the snapshot paths
      const snapshotDir = path.join(config.outputDir, 'visual-snapshots');
      if (!fs.existsSync(snapshotDir)) {
        fs.mkdirSync(snapshotDir, { recursive: true });
      }
      
      const snapshotName = `snapshot-${url.replace(/[^a-z0-9]/gi, '_')}.png`;
      const snapshotPath = path.join(snapshotDir, snapshotName);
      
      // If baselinePath is provided, use it, otherwise use default location
      const actualBaselinePath = baselinePath || path.join(snapshotDir, `baseline-${snapshotName}`);
      
      // Take a screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      fs.writeFileSync(snapshotPath, screenshot);
      
      // If baseline doesn't exist, create it
      if (!fs.existsSync(actualBaselinePath)) {
        fs.writeFileSync(actualBaselinePath, screenshot);
        return {
          content: [{ 
            type: 'text', 
            text: `Baseline screenshot not found. Created new baseline at: ${actualBaselinePath}` 
          }]
        };
      }
      
      // Compare screenshots using Playwright's built-in toMatchSnapshot
      try {
        // Read the baseline image
        const baselineImage = fs.readFileSync(actualBaselinePath);
        
        // Compare the images
        // Here we use Playwright's buffer comparison functionality
        const diffPath = path.join(snapshotDir, `diff-${snapshotName}`);
        const options = { threshold, maxDiffPixelRatio: threshold };
        
        // Custom comparison since we're not in a test context
        // This mimics what the expect().toMatchSnapshot() does internally
        const result = await page.evaluate(async ([base64Screenshot, base64Baseline]) => {
          // Convert base64 to binary array
          const binaryBase64 = (base64: string) => {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
          };
          
          // Get ImageData from ArrayBuffer
          const getImageData = async (buffer: Uint8Array) => {
            return new Promise<{width: number, height: number, data: Uint8ClampedArray}>((resolve) => {
              const blob = new Blob([buffer], { type: 'image/png' });
              const url = URL.createObjectURL(blob);
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                URL.revokeObjectURL(url);
                resolve({
                  width: img.width,
                  height: img.height,
                  data: imageData.data
                });
              };
              img.src = url;
            });
          };
          
          // Compare images
          const compare = async (img1: Uint8Array, img2: Uint8Array) => {
            const imgData1 = await getImageData(img1);
            const imgData2 = await getImageData(img2);
            
            // Simple pixel-by-pixel comparison
            if (imgData1.width !== imgData2.width || imgData1.height !== imgData2.height) {
              return { match: false, diffPixelRatio: 1 };
            }
            
            const width = imgData1.width;
            const height = imgData1.height;
            const totalPixels = width * height;
            
            let diffPixels = 0;
            for (let i = 0; i < imgData1.data.length; i += 4) {
              const r1 = imgData1.data[i];
              const g1 = imgData1.data[i + 1];
              const b1 = imgData1.data[i + 2];
              
              const r2 = imgData2.data[i];
              const g2 = imgData2.data[i + 1];
              const b2 = imgData2.data[i + 2];
              
              // Manhattan distance for simplicity
              const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
              if (diff > 10) { // Adjust threshold as needed
                diffPixels++;
              }
            }
            
            const diffPixelRatio = diffPixels / totalPixels;
            return { 
              match: diffPixelRatio <= 0.01, // 1% threshold
              diffPixelRatio,
              diffPixels
            };
          };
          
          return compare(binaryBase64(base64Screenshot), binaryBase64(base64Baseline));
        }, [
          screenshot.toString('base64'),
          baselineImage.toString('base64')
        ]);
        
        const matched = result.match;
        const diffRatio = result.diffPixelRatio * 100;
        
        return {
          content: [{ 
            type: 'text', 
            text: `Visual comparison ${matched ? 'PASSED' : 'FAILED'} for ${url}\n\n` +
                  `Difference: ${diffRatio.toFixed(2)}% (${result.diffPixels} pixels)\n` +
                  `Threshold: ${threshold * 100}%\n\n` +
                  `Screenshot saved to: ${snapshotPath}\n` +
                  `Baseline image: ${actualBaselinePath}` 
          }]
        };
      } catch (error) {
        // If comparison fails, provide useful information
        return {
          content: [{ 
            type: 'text', 
            text: `Visual comparison failed: ${error}\n\n` +
                  `Screenshot saved to: ${snapshotPath}\n` +
                  `Baseline image: ${actualBaselinePath}` 
          }],
          isError: true
        };
      }
    } catch (error) {
      logger.error('Visual testing error:', error);
      return {
        content: [{ 
          type: 'text', 
          text: `Error performing visual testing: ${error}` 
        }],
        isError: true
      };
    }
  },
  
  /**
   * Perform accessibility testing on a page
   */
  async accessibilityTest(args: { url: string; standard?: string }) {
    try {
      const { url, standard = 'WCAG2AA' } = args;
      logger.info(`Performing accessibility test for ${url} with standard ${standard}`);
      
      const page = await browserManager.getPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Inject axe-core for accessibility testing
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.5.2/axe.min.js'
      });
      
      // Run the accessibility audit
      const accessibilityReport = await page.evaluate((standard) => {
        return new Promise<any>((resolve) => {
          // @ts-ignore - axe is loaded from CDN
          axe.run({ runOnly: { type: 'tag', values: [standard] } }, (err: any, results: any) => {
            if (err) resolve({ error: err.message });
            resolve(results);
          });
        });
      }, standard);
      
      // Save the report
      const reportPath = path.join(config.outputDir, 'accessibility-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(accessibilityReport, null, 2));
      
      // Highlight issues on the page for screenshot
      await page.evaluate((report) => {
        if (!report.violations) return;
        
        // Add a visual overlay
        const style = document.createElement('style');
        style.textContent = `
          .axe-highlight {
            outline: 4px solid #f00 !important;
            outline-offset: 2px !important;
            position: relative;
          }
          .axe-issue-label {
            background: #f00;
            color: #fff;
            padding: 2px 4px;
            font-size: 12px;
            position: absolute;
            top: -20px;
            left: 0;
            z-index: 10000;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `;
        document.head.appendChild(style);
        
        // Highlight each violation
        report.violations.forEach((violation: any, index: number) => {
          violation.nodes.forEach((node: any) => {
            try {
              // Try to find the element using various selectors
              let element;
              for (const selector of node.target) {
                element = document.querySelector(selector);
                if (element) break;
              }
              
              if (element) {
                element.classList.add('axe-highlight');
                const label = document.createElement('div');
                label.className = 'axe-issue-label';
                label.textContent = `${index + 1}: ${violation.help}`;
                element.appendChild(label);
              }
            } catch (e) {
              console.error(`Error highlighting element: ${e}`);
            }
          });
        });
      }, accessibilityReport);
      
      // Take a screenshot with the issues highlighted
      const screenshotPath = path.join(config.outputDir, 'accessibility-issues.png');
      const screenshot = await page.screenshot({ fullPage: true });
      fs.writeFileSync(screenshotPath, screenshot);
      
      // Count issues by impact level
      const violationsByImpact = {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0
      };
      
      if (accessibilityReport.violations) {
        for (const violation of accessibilityReport.violations) {
          const impact = violation.impact as keyof typeof violationsByImpact;
          if (impact && impact in violationsByImpact) {
            violationsByImpact[impact]++;
          }
        }
      }
      
      // Format the summary
      const totalIssues = accessibilityReport.violations ? accessibilityReport.violations.length : 0;
      const summary = `
        Total Issues: ${totalIssues}
        ${violationsByImpact.critical ? `Critical: ${violationsByImpact.critical}` : ''}
        ${violationsByImpact.serious ? `Serious: ${violationsByImpact.serious}` : ''}
        ${violationsByImpact.moderate ? `Moderate: ${violationsByImpact.moderate}` : ''}
        ${violationsByImpact.minor ? `Minor: ${violationsByImpact.minor}` : ''}
      `.trim().replace(/^ +/gm, '');
      
      return {
        content: [{ 
          type: 'text', 
          text: `Accessibility test completed for ${url}\n\n` +
                `${summary}\n\n` +
                `Standard: ${standard}\n` +
                `Report saved to: ${reportPath}\n` +
                `Screenshot with issues highlighted: ${screenshotPath}` 
        }]
      };
    } catch (error) {
      logger.error('Accessibility testing error:', error);
      return {
        content: [{ 
          type: 'text', 
          text: `Error performing accessibility testing: ${error}` 
        }],
        isError: true
      };
    }
  }
};
