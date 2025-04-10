# AutoSpectra MCP Server

[![Node.js CI](https://github.com/autospectra/autospectra-mcp-server/actions/workflows/deploy.yml/badge.svg)](https://github.com/autospectra/autospectra-mcp-server/actions/workflows/deploy.yml)
[![Documentation](https://github.com/autospectra/autospectra-mcp-server/actions/workflows/docs.yml/badge.svg)](https://github.com/autospectra/autospectra-mcp-server/actions/workflows/docs.yml)
[![Render](https://img.shields.io/badge/Deploy-Render-cyan)](https://render.com)
[![Smithery AI](https://img.shields.io/badge/Integration-Smithery%20AI-blueviolet)](https://smithery.ai)
[![smithery badge](https://smithery.ai/badge/@samuelvinay91/autospectra-mcp-server)](https://smithery.ai/server/@samuelvinay91/autospectra-mcp-server)

A powerful browser automation and testing server using the Model Context Protocol (MCP). AutoSpectra enables AI agents to control browsers, generate tests, and perform accessibility and visual testing with seamless cloud integration.

![AutoSpectra MCP Server](assets/logo.svg)

## ✨ Features

- **Browser Automation**: Navigate web pages, click elements, type text, and more
- **Test Generation**: Create test scripts for Playwright, Mocha, and other frameworks
- **Accessibility Testing**: Check web pages for accessibility issues
- **Visual Testing**: Compare visual snapshots of web pages
- **Cloud Ready**: Easily deploy to cloud providers like Render.com
- **AI Integration**: Seamless connection with Smithery AI

## 🚀 Quick Start

### Installing via Smithery

To install autospectra-mcp-server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@samuelvinay91/autospectra-mcp-server):

```bash
npx -y @smithery/cli install @samuelvinay91/autospectra-mcp-server --client claude
```

### Local Development

```bash
# Clone this repository
git clone https://github.com/autospectra/autospectra-mcp-server.git
cd autospectra-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run the server
npm start
```

### Environment Configuration

Create a `.env` file with the following settings:

```
# Server configuration
PORT=3000
DEBUG=true

# Playwright configuration
HEADLESS=false  # Set to true for headless browser operation
SLOW_MO=50      # Slow down operations for better visibility (ms)

# Output directory
OUTPUT_DIR=./output
```

## 🔧 Integration with Smithery AI

AutoSpectra MCP Server can be easily integrated with Smithery AI to enable browser automation capabilities for AI agents. See our [Smithery Integration Guide](docs/smithery-integration.md) for detailed instructions.

## ☁️ Cloud Deployment

Deploy AutoSpectra to any cloud provider for remote access. We provide deployment templates for Render.com and other services.

Check our [Cloud Deployment Guide](docs/CLOUD_DEPLOYMENT.md) for step-by-step instructions.

## 📖 Documentation

- [Quick Reference](docs/QUICK_REFERENCE.md) - Command and API reference
- [Smithery Integration](docs/smithery-integration.md) - Connect with Smithery AI
- [Cloud Deployment](docs/CLOUD_DEPLOYMENT.md) - Deploy to cloud providers

## 🧩 Available Tools

AutoSpectra provides a wide range of tools for browser automation and testing:

- **navigate**: Navigate to a URL
- **click**: Click on an element
- **type**: Type text into an input field
- **extract**: Extract data from an element
- **screenshot**: Take a screenshot
- **check_accessibility**: Run accessibility tests
- **generate_tests**: Generate test cases for an application
- **visual_comparison**: Compare visual snapshots
- **run_test**: Run a generated test file

## 🧪 Development Workflow

### Semantic Versioning

We use semantic versioning for releases. Version numbers are automatically managed through GitHub Actions.

To create a new release:

1. Go to the "Actions" tab in GitHub
2. Select the "Semantic Versioning" workflow
3. Click "Run workflow"
4. Choose the version type: patch, minor, or major

### Continuous Deployment

- **GitHub Actions**: Automated CI/CD pipeline for testing and deployment
- **Render.com**: Automatic deployment from GitHub
- **Documentation**: Automatically generated and published to GitHub Pages

## 📄 License

MIT
