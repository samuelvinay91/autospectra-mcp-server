/**
 * Visible Browser Test for MCP Tools
 * 
 * This script uses the AutoSpectra MCP server's automation tools directly to test
 * visible browser functionality. It uses the same code path that the MCP tools use,
 * but runs it directly to verify configuration and visibility settings.
 */

const { automationTools } = require('./build/automation/index');
const { browserManager } = require('./build/automation/browserManager');
const { config } = require('./build/utils/config');

async function runMcpToolsTest() {
  try {
    console.log('📋 Current config settings:');
    console.log(`  headless: ${config.headless ? 'true' : 'false'}`);
    console.log(`  slowMo: ${config.slowMo}ms`);
    console.log(`  debug: ${config.debug ? 'true' : 'false'}`);
    
    console.log('\n🚀 Testing MCP tool browser visibility...');
    console.log('💻 This test uses the SAME code path as the MCP tools');

    // Use native Promise.resolve for cleaner logging before starting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 1: Navigate to a website
    console.log('\n🌐 Testing navigation tool...');
    const navigateResult = await automationTools.navigate({ url: 'https://example.com' });
    console.log('✅ Navigation completed');
    
    // Use a longer delay to make the browser more visible
    console.log('⌛ Waiting 5 seconds to view the browser...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 2: Take a screenshot
    console.log('\n📸 Testing screenshot tool...');
    const screenshotResult = await automationTools.screenshot({ fullPage: true });
    console.log('✅ Screenshot captured');
    
    // Step 3: Click on a link
    console.log('\n🖱️ Testing click tool...');
    await automationTools.click({ selector: 'a[href="https://www.iana.org/domains/example"]' });
    console.log('✅ Click action completed');
    
    // Wait again to view the result
    console.log('⌛ Waiting 5 seconds to view the result...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 4: Add visual indicator to prove browser visibility
    console.log('\n🎨 Adding visual indicator to browser...');
    const page = await browserManager.getPage();
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
      div.style.borderRadius = '5px';
      div.textContent = 'AutoSpectra MCP Tool Test';
      document.body.appendChild(div);
    });
    console.log('✅ Visual indicator added');
    
    // Use a longer delay to view the result
    console.log('⌛ Waiting 10 seconds to view the final result...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Clean up
    console.log('\n👋 Closing browser...');
    await browserManager.closeBrowser();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    // Try to clean up anyway
    try {
      await browserManager.closeBrowser();
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}

// Run the test
console.log('🔍 Starting AutoSpectra MCP tools visibility test...');
runMcpToolsTest();
