# AutoSpectra MCP Server

<div align="center">
  <img src="assets/logo.svg" alt="AutoSpectra Logo" width="200">
  <p><strong>Browser Automation and Testing with Claude Computer Use Integration</strong></p>
</div>

AutoSpectra is an MCP (Model Context Protocol) server that provides browser automation, testing, and Claude Computer Use integration capabilities. It enables advanced browser control with visible or headless modes, accessibility testing, and integration with Anthropic's Claude AI capabilities.

## Features

- **🌐 Browser Automation**: Navigate, click, type, extract data, and take screenshots
- **🧪 Testing Tools**: End-to-end testing, accessibility testing, and visual validation
- **🧠 Claude Integration**: Use Claude's Computer Use capabilities in your automation
- **👁️ Visible Browser Mode**: Debug with visible browsers or run headless for efficiency
- **🔄 Self-Healing Selectors**: Robust element selection that adapts to changes
- **🔌 MCP Protocol**: Easy integration with Claude and other MCP-compatible systems

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/autospectra-mcp-server.git
cd autospectra-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Server configuration
PORT=3000
DEBUG=true
HTTP_SERVER=true

# API Keys
ANTHROPIC_API_KEY=your-anthropic-api-key

# Playwright configuration
HEADLESS=false
SLOW_MO=50

# Output directory
OUTPUT_DIR=./output
```

## Usage

### Starting the Server

```bash
# Start the server
npm start

# Or start in development mode
npm run dev
```

### Using the MCP Tools

The server provides browser automation tools that can be used through the MCP protocol:

```javascript
// Navigate to a URL with visible browser
await use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: {
    url: "https://example.com",
    visible: true
  }
});

// Click on an element with selector
await use_mcp_tool({
  server_name: "autospectra",
  tool_name: "click",
  arguments: {
    selector: "#login-button",
    visible: true
  }
});
```

See the [Usage Guide](docs/api/tools/USAGE_GUIDE.md) for more examples.

## Project Structure

```
autospectra-mcp-server/
├── docs/                # Documentation
│   ├── guides/          # User and developer guides
│   ├── api/             # API documentation
│   └── examples/        # Example usage
├── scripts/             # Utility and helper scripts
├── src/                 # Source code
│   ├── automation/      # Browser automation
│   ├── computerUse/     # Claude computer use integration
│   ├── frameworks/      # Test framework integration
│   ├── nlp/             # NLP functionality
│   ├── server/          # Server-specific code
│   └── utils/           # Utilities
├── tests/               # Test files
│   ├── integration/     # Integration tests
│   ├── unit/            # Unit tests
│   └── e2e/             # End-to-end tests
```

## Integration with Claude

AutoSpectra integrates with Claude's Computer Use capabilities, allowing you to:

1. Access Claude's virtual computer environment
2. Perform browser automation and testing through Claude
3. Combine local and cloud-based automation

See the [Computer Use Guide](docs/guides/computer-use/COMPUTER_USE.md) for more information.

## Integration with Cline

AutoSpectra can be used alongside Cline's browser_action tools:

1. Use Cline for exploratory testing and visual debugging
2. Use AutoSpectra for programmatic testing with selectors
3. Create powerful workflows combining both approaches

See the [Cline Integration Guide](docs/guides/browser/CLINE_BROWSER_INTEGRATION.md) for more information.

## Docker Support

```bash
# Build the Docker image
npm run docker:build

# Run with Docker
npm run docker:run
```

## Testing

```bash
# Run all tests
npm run test:all

# Run specific tests
npm run test:accessibility
npm run test:computer-use
npm run test:e2e
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
