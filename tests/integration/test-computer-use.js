/**
 * Test script for demonstrating the computer use functionality
 *
 * Usage:
 * node test-computer-use.js
 *
 * Make sure to set the ANTHROPIC_API_KEY environment variable before running
 */

const axios = require('axios');

// URL of the running MCP server
const SERVER_URL = 'http://localhost:3001';

// API key for communicating with the MCP server (if needed)
const MCP_API_KEY = process.env.MCP_API_KEY || '';

// Example prompt for computer use
const EXAMPLE_PROMPT = "Create a text file named hello.txt with the content 'Hello world!' and then list the files in the current directory.";

// Headers for API requests
const headers = {
  'Content-Type': 'application/json',
  ...(MCP_API_KEY ? { 'Authorization': `Bearer ${MCP_API_KEY}` } : {})
};

/**
 * Main function that demonstrates the computer use workflow
 */
async function demonstrateComputerUse() {
  console.log('🚀 Testing AutoSpectra Computer Use Functionality');
  console.log('-----------------------------------------------');

  try {
    // First check if the server is reachable
    try {
      await axios.get(`${SERVER_URL}/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.error('❌ Cannot connect to server. Make sure it is running on port 3001');
      process.exit(1);
    }

    // Step 1: Initialize the API provider (API-only in this example)
    console.log('\nStep 1: Initializing the API provider...');

    const initResponse = await axios.post(
      `${SERVER_URL}/api/tools/initialize_computer`,
      {
        type: 'api'
      },
      { headers }
    );

    console.log('✅ Provider initialized:', initResponse.data.content[0].text);
    console.log('-----------------------------------------------');

    // Step 2: Use the computer capabilities
    console.log('Step 2: Using computer capabilities...');
    console.log(`Prompt: "${EXAMPLE_PROMPT}"`);

    const useResponse = await axios.post(
      `${SERVER_URL}/api/tools/use_computer`,
      {
        prompt: EXAMPLE_PROMPT
      },
      { headers }
    );

    console.log('✅ Computer use response:');
    console.log(useResponse.data.content[0].text);

    // Check if there are any images in the response
    if (useResponse.data.content.length > 1) {
      console.log(`✅ Received ${useResponse.data.content.length - 1} screenshots from the computer use operation`);
    }

    console.log('-----------------------------------------------');

    // Step 3: Clean up resources
    console.log('Step 3: Cleaning up resources...');

    const cleanupResponse = await axios.post(
      `${SERVER_URL}/api/tools/cleanup_computer`,
      {},
      { headers }
    );

    console.log('✅ Cleanup complete:', cleanupResponse.data.content[0].text);
    console.log('-----------------------------------------------');

    console.log('✨ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error during test:', error.response?.data || error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the demonstration
demonstrateComputerUse();
