/**
 * Test Script for Claude Computer Use Browser Navigation
 * 
 * This script tests Claude's ability to navigate a web browser through the Computer Use API.
 */

const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

// Test configuration
const apiKey = process.env.ANTHROPIC_API_KEY;
const model = 'claude-3-7-sonnet-20250219';
const betaFlag = 'computer-use-2025-01-24';
const toolVersion = '20250124'; // For Claude 3.7 Sonnet

console.log(`Testing Claude Computer Browser Navigation with model: ${model}`);
console.log(`API Key (masked): ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5) : 'Not found'}`);

// Define the test prompt
const testPrompt = 'Open Google Chrome, navigate to https://www.example.com, and take a screenshot of the website';

// Define the computer use tools
const tools = [
  {
    type: `computer_${toolVersion}`,
    name: "computer",
    display_width_px: 1024,
    display_height_px: 768,
    display_number: 1
  },
  {
    type: `text_editor_${toolVersion}`, 
    name: "str_replace_editor"
  },
  {
    type: `bash_${toolVersion}`,
    name: "bash"
  }
];

// Thinking capability for Claude 3.7
const thinking = { type: 'enabled', budget_tokens: 1024 };

async function testBrowserNavigation() {
  try {
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    // Initialize the Anthropic client
    console.log('Initializing Anthropic client...');
    const client = new Anthropic({
      apiKey: apiKey,
    });

    // Send a test request to Claude with computer use tools
    console.log('Sending test request to Claude...');
    console.log(`Prompt: "${testPrompt}"`);
    console.log(`Tools: ${JSON.stringify(tools.map(t => t.type))}`);
    console.log(`Beta flag: ${betaFlag}`);
    console.log('Thinking feature enabled with budget: 1024 tokens');

    const startTime = Date.now();
    const response = await client.beta.messages.create({
      model,
      max_tokens: 2048, // Must be greater than thinking.budget_tokens
      messages: [{ role: 'user', content: testPrompt }],
      tools,
      betas: [betaFlag],
      thinking
    });
    const duration = Date.now() - startTime;

    console.log(`✅ Test successful! Response received in ${duration}ms.`);
    
    // Process and display response
    const textContent = response.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');
    
    const toolUse = response.content
      .filter(c => c.type === 'tool_use');
    
    console.log('\n--- Text Content ---');
    console.log(textContent);
    
    if (toolUse.length > 0) {
      console.log('\n--- Tool Use ---');
      console.log(JSON.stringify(toolUse, null, 2));
    }
    
    // Extract thinking content if available
    if (response.thinking) {
      console.log('\n--- Thinking Content ---');
      console.log(response.thinking.content
        .map(t => t.text)
        .join('\n'));
    }

    // Extract any images if present
    const images = response.content
      .filter(c => c.type === 'image');
    
    if (images.length > 0) {
      console.log('\n--- Images ---');
      console.log(`Received ${images.length} image(s) in response`);
    }

    return true;
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(`  Status: ${error.status || 'unknown'}`);
    console.error(`  Type: ${error.type || 'unknown'}`);
    console.error(`  Message: ${error.message || 'unknown'}`);
    
    if (error.message?.includes('does not support tool types')) {
      console.error(`\nThis error indicates a model/tool compatibility issue.`);
      console.error(`Ensure that model '${model}' supports the tool versions specified.`);
    } else if (error.status === 401) {
      console.error(`\nThis error indicates an authentication issue with the API key.`);
      console.error(`Verify that the API key is valid and properly formatted.`);
    } else if (error.status === 403) {
      console.error(`\nThis error indicates a permissions issue with the API key.`);
      console.error(`Verify that the API key has access to Claude Computer Use capabilities.`);
    }
    
    if (error.response?.data) {
      console.error('  API Response details:', error.response.data);
    }
    
    return false;
  }
}

// Run the test
testBrowserNavigation().then(success => {
  if (success) {
    console.log('\n=== Browser navigation test completed successfully ===');
  } else {
    console.log('\n=== Browser navigation test failed ===');
    console.log('\nSuggested troubleshooting:');
    console.log('1. Verify that your API key has access to Claude 3.7 Sonnet');
    console.log('2. Check that you have access to the Computer Use beta');
    console.log('3. Verify the correct beta flag is being used');
  }
  process.exit(success ? 0 : 1);
});
