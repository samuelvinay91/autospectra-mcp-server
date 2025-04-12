# Testing the Claude Computer Use Integration

Follow this guide to test the new Claude Computer Use capabilities in your AutoSpectra MCP server.

## Prerequisites

1. Make sure you have the Anthropic API key with computer use access
2. For container testing, ensure Docker is installed and running

## Testing Steps

### 1. Set up your environment

```bash
# Set your Anthropic API key as an environment variable
export ANTHROPIC_API_KEY=your_api_key_here
```

### 2. Start the MCP server

```bash
# Build the project if you haven't already
npm run build

# Start the server
npm start
```

The server should start and display a message like:
```
AutoSpectra MCP server running on stdio
```

### 3. Testing with the provided test script

We've created a test script (`test-computer-use.js`) that demonstrates the computer use functionality:

```bash
# Install axios if you don't have it
npm install axios

# Run the test script
node test-computer-use.js
```

This script will:
1. Initialize the API-only provider
2. Use computer capabilities to create a file and list directory contents
3. Clean up resources

### 4. Manual testing with the API

You can also test the MCP tools directly:

#### API-Only Provider Testing

```bash
# Initialize the API provider
curl -X POST http://localhost:3000/api/tools/initialize_computer \
  -H "Content-Type: application/json" \
  -d '{"type": "api"}'

# Use computer capabilities
curl -X POST http://localhost:3000/api/tools/use_computer \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a text file named test.txt with the content \"Hello from AutoSpectra\" and then display its contents"}'

# Clean up
curl -X POST http://localhost:3000/api/tools/cleanup_computer \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Smart Computer Use Testing

```bash
# Test smart computer use with automation fallback
curl -X POST http://localhost:3000/api/tools/smart_computer_use \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Navigate to https://example.com and take a screenshot of the page", "useAutomation": true}'
```

### 5. Container Provider Testing (if Docker is installed)

```bash
# Initialize the container provider
curl -X POST http://localhost:3000/api/tools/initialize_computer \
  -H "Content-Type: application/json" \
  -d '{"type": "container", "width": 1280, "height": 800}'

# Use computer capabilities
curl -X POST http://localhost:3000/api/tools/use_computer \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Open Firefox, navigate to wikipedia.org, and search for \"artificial intelligence\""}'

# Clean up
curl -X POST http://localhost:3000/api/tools/cleanup_computer \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Troubleshooting

1. **API Key Issues**: Ensure your Anthropic API key is set correctly and has computer use access.

2. **Container Issues**: If using the container provider:
   - Verify Docker is running
   - Check Docker logs: `docker logs $(docker ps -q --filter ancestor=anthropic-quickstarts:computer-use-demo-latest)`

3. **Server Connection Issues**: Ensure the server is running and the port (default 3000) is correct in the test script.

4. **Tool Not Found Errors**: Make sure the server has started correctly and the tool names match exactly.

## Adding to the main Claude interface

To have these tools appear in the main Claude interface:

1. Edit your MCP settings file (typically in VSCode's globalsStorage or the Claude desktop app's config)
2. Include your MCP server in the configuration
3. Restart Claude/VSCode

The computer use tools should now appear as available tools in Claude's interface!
