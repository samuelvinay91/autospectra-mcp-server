// A standalone script to forcefully launch a visible browser without any headless mode
// This will help diagnose issues with browser visibility

const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Launching a visible browser window...');
  
  try {
    // Force a new browser instance with maximum visibility settings
    const browser = await chromium.launch({
      headless: false,  // Ensure non-headless mode
      slowMo: 1000,     // Very slow motion for visibility
      args: [
        '--start-maximized',
        '--window-position=50,50',
        '--no-sandbox',
        '--disable-gpu-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    
    console.log('✅ Browser launched successfully!');
    
    // Open a new page and navigate to a test site
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      colorScheme: 'light'
    });
    
    const page = await context.newPage();
    
    console.log('📄 Opening a test page...');
    await page.goto('https://example.com');
    
    // Add a highly visible element to confirm the browser is running
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.top = '10px';
      div.style.left = '10px';
      div.style.padding = '20px';
      div.style.background = 'red';
      div.style.color = 'white';
      div.style.fontSize = '24px';
      div.style.fontWeight = 'bold';
      div.style.zIndex = '9999';
      div.textContent = 'BROWSER IS VISIBLE! 🎉';
      document.body.appendChild(div);
    });
    
    console.log('⏳ Keeping browser open for 15 seconds...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('👋 Closing browser...');
    await browser.close();
    console.log('✅ Test completed!');
  } catch (error) {
    console.error('❌ Error launching browser:', error);
  }
})();
