// Simple test to verify the test runner functionality
const { testRunner } = require('./build/utils/testRunner');
const path = require('path');

async function runTest() {
  console.log('Starting test runner verification...');
  
  // Path to the generated test file
  const testFilePath = path.join(
    __dirname, 
    'output',
    'playwright-test.js'
  );
  
  console.log(`Running test file: ${testFilePath}`);
  
  try {
    // First make sure Playwright is installed
    console.log('Checking Playwright installation...');
    const isInstalled = await testRunner.ensurePlaywrightInstalled();
    console.log(`Playwright installation check result: ${isInstalled}`);
    
    if (isInstalled) {
      // Run the test file
      console.log('Running the test file...');
      const result = await testRunner.runTest(testFilePath);
      
      console.log('Test Result:');
      console.log(`Success: ${result.success}`);
      console.log(`Output: ${result.output}`);
      
      if (result.screenshots && result.screenshots.length > 0) {
        console.log('Screenshots captured:');
        result.screenshots.forEach(screenshot => {
          console.log(` - ${screenshot}`);
        });
      } else {
        console.log('No screenshots captured');
      }
    } else {
      console.log('Failed to ensure Playwright is installed');
    }
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
runTest().catch(console.error);
