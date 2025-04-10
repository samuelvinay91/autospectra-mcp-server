// This script directly tests the accessibility testing functionality
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🔍 Testing accessibility checking functionality...');
  
  try {
    // Launch a visible browser for testing
    const browser = await chromium.launch({
      headless: false,
      slowMo: 100,
      args: ['--start-maximized', '--window-position=50,50']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Navigate to the W3C bad example page
    console.log('📄 Opening the W3C accessibility demo page (with known issues)...');
    await page.goto('https://www.w3.org/WAI/demos/bad/before/home.html');
    
    // Inject axe-core from CDN
    console.log('🧰 Injecting axe-core accessibility testing library...');
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js'
    });
    
    // Wait to ensure axe is loaded
    await page.waitForFunction(() => window.axe);
    
    // Run the accessibility test
    console.log('🧪 Running accessibility tests...');
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        axe.run(document, {
          resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable']
        })
        .then(results => resolve(results))
        .catch(err => resolve({ error: err.toString() }));
      });
    });
    
    // Output the results
    console.log('\n🔍 Accessibility Test Results:');
    console.log(`- ${results.violations?.length || 0} violations found`);
    console.log(`- ${results.passes?.length || 0} tests passed`);
    console.log(`- ${results.incomplete?.length || 0} tests need review\n`);
    
    if (results.violations && results.violations.length > 0) {
      console.log('⚠️ Top violations:');
      
      // Include details for up to 5 violations
      const topViolations = results.violations.slice(0, 5);
      topViolations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.description} (impact: ${violation.impact})`);
        console.log(`   - WCAG: ${violation.tags.filter(tag => tag.startsWith('wcag')).join(', ')}`);
        console.log(`   - Affects ${violation.nodes.length} element(s)\n`);
      });
    }
    
    // Save full results to file
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const reportPath = path.join(outputDir, 'direct-accessibility-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`✅ Detailed report saved to ${reportPath}`);
    
    // Highlight violations if any
    if (results.violations && results.violations.length > 0) {
      console.log('🖌️ Highlighting violations on the page...');
      
      // Highlight violations
      await page.evaluate((violations) => {
        // Create styles
        const style = document.createElement('style');
        style.innerHTML = `
          .axe-violation-marker {
            border: 4px solid red !important;
            background-color: rgba(255, 0, 0, 0.2) !important;
            position: relative;
          }
        `;
        document.head.appendChild(style);
        
        // Highlight each element with a violation
        violations.forEach((violation, violationIndex) => {
          violation.nodes.forEach((node) => {
            try {
              const selector = node.target[0];
              document.querySelectorAll(selector).forEach(element => {
                element.classList.add('axe-violation-marker');
                element.setAttribute('title', `Issue: ${violation.description}`);
              });
            } catch (e) {
              console.error("Error highlighting element:", e);
            }
          });
        });
      }, results.violations);
      
      // Take a screenshot
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      const screenshotPath = path.join(outputDir, 'direct-accessibility-violations.png');
      fs.writeFileSync(screenshotPath, screenshotBuffer);
      console.log(`📸 Screenshot with highlighted violations saved to ${screenshotPath}`);
    }
    
    // Keep browser open for manual inspection
    console.log('⏳ Keeping browser open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    await browser.close();
    console.log('✅ Test completed');
  } catch (error) {
    console.error('❌ Error testing accessibility:', error);
  }
})();
