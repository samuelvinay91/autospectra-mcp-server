/**
 * Test Script for Visible Browser Automation
 *
 * This script demonstrates a visible browser being launched using the AutoSpectra
 * browser automation tools directly, similar to how Claude Desktop operates.
 */

const { chromium } = require('playwright');

async function runVisibleBrowserTest() {
  console.log('🚀 Launching visible browser with AutoSpectra automation...');

  try {
    // Force a new browser instance with maximum visibility settings
    const browser = await chromium.launch({
      headless: false,        // Ensure non-headless mode
      slowMo: 500,            // Slow motion for visibility
      args: [
        '--start-maximized',
        '--window-position=50,50',
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    console.log('✅ Browser launched successfully!');

    // Open a new page with a visible size
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      colorScheme: 'light'
    });

    const page = await context.newPage();

    // Navigate to example.com
    console.log('📄 Navigating to example.com...');
    await page.goto('https://example.com');

    // Add a visual indicator
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.top = '10px';
      div.style.left = '10px';
      div.style.padding = '20px';
      div.style.background = 'blue';
      div.style.color = 'white';
      div.style.fontSize = '24px';
      div.style.fontWeight = 'bold';
      div.style.zIndex = '9999';
      div.textContent = 'AutoSpectra Visible Browser Test';
      document.body.appendChild(div);
    });

    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: '../../output/screenshots/example-visible-browser.png' });
    console.log('✅ Screenshot saved to output/screenshots/example-visible-browser.png');

    // Demonstrate some interactions
    console.log('🖱️ Performing visible interactions...');

    // Highlight the heading by clicking on it
    const heading = await page.$('h1');
    if (heading) {
      // Add highlight effect
      await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        h1.style.backgroundColor = 'yellow';
        h1.style.padding = '10px';
        h1.style.transition = 'all 0.5s';
      });

      // Click the heading
      await heading.click();

      // Wait for visual confirmation
      await page.waitForTimeout(2000);
    }

    // Add a form element to demonstrate typing
    await page.evaluate(() => {
      const form = document.createElement('div');
      form.innerHTML = `
        <div style="margin: 40px; padding: 20px; border: 2px solid #ccc; border-radius: 8px;">
          <h3>Interactive Test Form</h3>
          <input type="text" id="test-input" placeholder="Text will be typed here..."
                 style="padding: 8px; width: 300px; margin: 10px 0;">
          <button id="test-button" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px;">
            Submit
          </button>
        </div>
      `;
      document.body.appendChild(form);
    });

    // Type into the input field
    console.log('⌨️ Testing typing functionality...');
    await page.type('#test-input', 'Hello from AutoSpectra browser automation!');

    // Click the button
    console.log('🖱️ Testing click functionality...');
    await page.click('#test-button');

    // Simulate navigation to another page
    console.log('🔄 Testing navigation...');
    await page.goto('https://example.org');

    // Keep browser open for a while
    console.log('⏳ Keeping browser open for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Close the browser
    console.log('👋 Closing browser...');
    await browser.close();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error during browser test:', error);
  }
}

// Run the test
runVisibleBrowserTest();
