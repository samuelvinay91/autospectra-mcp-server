// A simple script to test the AutoSpectra MCP Server
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// __dirname is already available in CommonJS

console.log('Starting AutoSpectra MCP Server test...');

// Function to run the server in a separate process
function startServer() {
  console.log('Starting the MCP server...');
  
  // Path to the server executable
  const serverPath = path.join(__dirname, '..', '..', 'build', 'index.js');
  
  // Make sure it's executable
  try {
    fs.accessSync(serverPath, fs.constants.X_OK);
  } catch (error) {
    console.log(`Making ${serverPath} executable...`);
    // In Windows, we don't need to chmod, but in Unix, we would need to
  }
  
  // Start the server
  const server = spawn('node', [serverPath], {
    stdio: 'pipe', // Capture all output
    env: {
      ...process.env,
      DEBUG: 'true',
      HEADLESS: 'false',
      SLOW_MO: '50'
    }
  });
  
  // Handle server output
  server.stdout.on('data', (data) => {
    console.log(`Server output: ${data}`);
  });
  
  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
  
  return server;
}

// Start the server
const serverProcess = startServer();

// Give it a moment to initialize
setTimeout(() => {
  console.log('\n-----------------------------------');
  console.log('AutoSpectra MCP Server should now be running!');
  console.log('-----------------------------------');
  console.log('To use it with any AI agent:');
  console.log('1. Make sure the MCP settings are properly configured for your AI platform');
  console.log('   Example (Claude): c:\\Users\\VINAY KUMAR\\AppData\\Roaming\\Code\\User\\globalStorage\\saoudrizwan.claude-dev\\settings\\cline_mcp_settings.json');
  console.log('2. Restart your AI agent if needed');
  console.log('3. Try using one of the AutoSpectra MCP tools from your AI agent');
  console.log('-----------------------------------');
  console.log('Example commands:');
  console.log('- List supported frameworks: use_mcp_tool with server_name "autospectra" and tool_name "list_frameworks"');
  console.log('- Generate tests: use_mcp_tool with server_name "autospectra" and tool_name "generate_tests"');
  console.log('-----------------------------------');
  console.log('Press Ctrl+C to stop the server when done testing.');
}, 2000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Stopping the server...');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});
