/**
 * API Key Test Script
 * 
 * Tests whether the Anthropic API key is working correctly
 * by making a simple API call directly.
 */

const { Anthropic } = require('@anthropic-ai/sdk');

// API Key to test - should be provided as a command line argument
const apiKey = process.argv[2] || process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('❌ No API key provided. Please provide an API key as a command line argument or set the ANTHROPIC_API_KEY environment variable.');
  console.error('Usage: node test-api-key.js YOUR_API_KEY');
  process.exit(1);
}

console.log(`Testing API key: ${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 8)}`);

async function testApiKey() {
  try {
    console.log('Initializing Anthropic client...');
    
    const client = new Anthropic({
      apiKey: apiKey,
    });
    
    console.log('Making a test API call...');
    
    const startTime = Date.now();
    // Try with a common model available to most API keys
    const modelToUse = 'claude-3-sonnet-20240229';
    console.log(`Using model: ${modelToUse}`);
    
    const response = await client.messages.create({
      model: modelToUse,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello, this is an API key test message.' }]
    });
    const duration = Date.now() - startTime;
    
    console.log(`✅ API key is valid! Response received in ${duration}ms.`);
    console.log('Response:', response.content.map(c => c.type === 'text' ? c.text : JSON.stringify(c)));
    
    return true;
  } catch (error) {
    console.error('❌ API key test failed:');
    if (error.status) {
      console.error(`  Status code: ${error.status}`);
    }
    
    if (error.type) {
      console.error(`  Error type: ${error.type}`);
    }
    
    if (error.message) {
      console.error(`  Error message: ${error.message}`);
    }
    
    if (error.response && error.response.data) {
      console.error('  Response data:', error.response.data);
    }
    
    return false;
  }
}

// Run the test
testApiKey().then(success => {
  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
