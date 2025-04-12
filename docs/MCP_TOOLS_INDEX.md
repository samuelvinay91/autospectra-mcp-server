# AutoSpectra MCP Server - Tools Documentation Index

This index provides a guide to AutoSpectra MCP server's tooling capabilities, current implementation, and future enhancement plans.

## Overview

AutoSpectra is an MCP (Model Context Protocol) server that provides browser automation, testing, and Claude Computer Use integration capabilities. It enables advanced browser control with visible or headless modes, accessibility testing, visual comparison, and integration with Anthropic's Claude AI capabilities.

## Current Tools Documentation

The [Current Tools List](CURRENT_TOOLS_LIST.md) provides a comprehensive reference guide to all tools currently available in the AutoSpectra MCP server:

- **Browser Automation Tools**: Navigate to URLs, click elements, type text, extract data, take screenshots, and run accessibility tests
- **Testing Tools**: Generate tests, process tasks with AI, record test sessions, perform visual comparisons, and run tests
- **Debugging Tools**: Create and manage debug test sessions with interactive controls and state management
- **Computer Use Tools**: Leverage Claude's computer capabilities with API and container-based implementations

Each tool is documented with its parameters, expected behavior, and usage examples to help you integrate the AutoSpectra MCP server into your workflows.

## Future Enhancements

The [Future Tool Enhancements](FUTURE_TOOL_ENHANCEMENTS.md) document outlines critical missing tools and enhancement opportunities:

1. **API Testing Tools**: HTTP requests, schema validation, API mocking, GraphQL support
2. **Database Integration**: Database connections, queries, and state reset capabilities
3. **Enhanced Test Management**: Test suites, data generation, parameterized tests, orchestration
4. **CI/CD Integration**: Pipeline generation, containerized environments, reporting
5. **Mobile Testing**: Device emulation, app installation and interaction
6. **Performance Testing**: Load testing, Lighthouse integration, metrics monitoring
7. **Security Testing**: Basic scanning, dependency checks, penetration testing
8. **Test Maintenance**: Refactoring, dependency analysis, test healing, analytics
9. **Collaboration Tools**: Documentation, sharing, session replay, annotations
10. **AI-Enhanced Features**: Test suggestions, failure analysis, optimization
11. **Cross-Browser & Environment Testing**: Browser matrix, platform testing, responsive design
12. **Visual Regression Enhanced Tools**: Component snapshots, AI-assisted diff analysis, design specs

## Additional Resources

- [USAGE_GUIDE.md](api/tools/USAGE_GUIDE.md) - Detailed tool usage instructions
- [API_TESTING_GUIDE.md](guides/API_TESTING_GUIDE.md) - Guide to API testing capabilities
- [LIVE_DEBUGGING.md](guides/LIVE_DEBUGGING.md) - Guide to debugging workflows
- [COMPUTER_USE.md](guides/computer-use/COMPUTER_USE.md) - Claude Computer Use integration
- [CLOUD_DEPLOYMENT.md](guides/deployment/CLOUD_DEPLOYMENT.md) - Cloud deployment guide

## Getting Started

To use AutoSpectra MCP server tools:

1. Ensure the server is running (`npm start`)
2. Use the MCP tools through the MCP protocol:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: {
    url: "https://example.com",
    visible: true
  }
});
```

## Contributing

To contribute to the AutoSpectra MCP server, including implementing new tools from the enhancement roadmap, please see [CONTRIBUTING.md](../CONTRIBUTING.md).
