# AutoSpectra MCP Server

<div align="center">
  <img src="assets/logo.png" alt="AutoSpectra Logo" width="200">
  <p><strong>Universal Browser Automation and Testing for All AI Agents</strong></p>
  
  [![smithery badge](https://smithery.ai/badge/@samuelvinay91/autospectra-mcp-server)](https://smithery.ai/server/@samuelvinay91/autospectra-mcp-server)
</div>

AutoSpectra is an MCP (Model Context Protocol) server that provides browser automation and testing capabilities for any AI agent. It enables advanced browser control with visible or headless modes, accessibility testing, and seamless integration with any MCP-compatible system, including but not limited to Claude, ChatGPT, Gemini, and Perplexity.

## Features

- **🌐 Browser Automation**: Navigate, click, type, extract data, and take screenshots
- **🧪 Testing Tools**: End-to-end testing, accessibility testing, and visual validation
- **🤖 AI Agent Compatibility**: Works with any AI agent supporting the MCP protocol
- **👁️ Visible Browser Mode**: Debug with visible browsers or run headless for efficiency
- **🔄 Self-Healing Selectors**: Robust element selection that adapts to changes
- **🔌 Universal MCP Protocol**: Easy integration with any MCP-compatible AI system

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

## Documentation

AutoSpectra provides comprehensive documentation of its tooling capabilities:

- [Tools Documentation Index](docs/MCP_TOOLS_INDEX.md) - Overview and index of all tools documentation
- [Current Tools List](docs/CURRENT_TOOLS_LIST.md) - Complete reference of all currently available tools with parameters and examples
- [Future Tool Enhancements](docs/FUTURE_TOOL_ENHANCEMENTS.md) - Roadmap of planned enhancements and missing tools

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

## Integration with AI Agents

AutoSpectra seamlessly integrates with any AI agent supporting the MCP protocol:

1. **Universal Compatibility**: Works with Claude, ChatGPT, Gemini, Perplexity, and more
2. **Advanced Capabilities**: Access specialized features like Claude's Computer Use
3. **Flexible Workflows**: Combine local and cloud-based automation

See the [AI Integration Guide](docs/guides/computer-use/COMPUTER_USE.md) for more information.

## Platform Integrations

AutoSpectra works with various AI platforms and development environments:

1. **Claude Desktop/Cloud**: Enhanced automation with Computer Use capabilities
2. **VS Code Extensions**: Seamless integration with development workflows
3. **ChatGPT & OpenAI**: Full support for GPT-based assistants
4. **Gemini & Other Models**: Compatible with all major AI platforms

See the [Platform Integration Guide](docs/guides/browser/CLINE_BROWSER_INTEGRATION.md) for more information.

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
