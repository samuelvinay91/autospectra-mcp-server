# Integrating AI Platform Browser Tools with AutoSpectra MCP Server

This document outlines how to leverage browser tools from various AI platforms alongside AutoSpectra MCP server for improved development, debugging, and testing workflows. While originally developed for Cline/Claude, these integration techniques work with any MCP-compatible AI platform.

## Overview of Browser Tool Options

When working on projects with AutoSpectra, you now have several browser automation options:

1. **AutoSpectra MCP Tools** (`navigate`, `click`, etc.) - Our MCP server's browser automation
2. **Claude Computer Use API** - Virtual environment in Anthropic's cloud
3. **Cline's Built-in Browser Actions** - The browser_action tools provided by Cline itself
4. **Direct Playwright Scripts** - Scripts like `visible-browser-test.js` that use Playwright directly

## Cline's Browser Tools Capabilities

Cline's `browser_action` tool provides these key capabilities:

- **Launch**: Start a browser with a specific URL
- **Click**: Perform clicks at specific x,y coordinates
- **Type**: Enter text using the keyboard
- **Scroll**: Navigate up and down pages
- **Screenshot Feedback**: Each action returns visual feedback
- **Local Execution**: Runs on your actual machine, not in the cloud

## Integration Approaches

### 1. Complementary Usage

The simplest approach is to use both tool sets side-by-side:

- **AutoSpectra MCP Tools**: For programmatic automation with self-healing selectors
- **Cline Browser Actions**: For direct visual interaction and debugging

```javascript
// Use Cline's browser_action for exploratory testing
browser_action({ action: "launch", url: "http://localhost:3000" });
browser_action({ action: "click", coordinate: "450,300" });

// Use AutoSpectra for programmatic testing with better selectors
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: { url: "http://localhost:3000", visible: true }
});
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "click", 
  arguments: { selector: "#login-button" }
});
```

### 2. Coordinated Workflow

You can create a coordinated workflow that uses both tools:

1. **Development**: Use Cline's browser_action for rapid UI exploration
2. **Test Creation**: Use AutoSpectra to create repeatable test cases
3. **Execution**: Run tests using AutoSpectra's MCP tools
4. **Debugging**: Switch to Cline's browser_action when issues arise

### 3. Enhanced Screenshots

While AutoSpectra takes screenshots after actions, Cline's browser_action provides immediate visual feedback. Use this to your advantage:

```javascript
// Take exploratory screenshots with Cline
browser_action({ action: "launch", url: "http://localhost:3000" });
browser_action({ action: "scroll_down" });
browser_action({ action: "close" });

// Run automated tests with AutoSpectra
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: { url: "http://localhost:3000" }
});
```

## Best Practices for Combined Usage

### When to Use Cline's browser_action

- **Exploratory Testing**: When you need to visually inspect a site
- **Ad-hoc Actions**: For quick one-off actions that don't need selectors
- **Visual Debugging**: When you need constant visual feedback
- **Direct Manipulation**: When exact coordinates are preferred over selectors

### When to Use AutoSpectra MCP Tools

- **Automated Testing**: For creating repeatable test scenarios
- **Element Selection**: When you need robust selectors instead of coordinates
- **API Integration**: When testing needs to integrate with APIs
- **Advanced Features**: For accessibility testing and other specialized tools

## Development Workflow Example

1. **Initial Exploration**:
   ```javascript
   browser_action({ action: "launch", url: "http://localhost:3000" });
   // Explore the application visually
   browser_action({ action: "close" });
   ```

2. **Automate with AutoSpectra**:
   ```javascript
   use_mcp_tool({
     server_name: "autospectra",
     tool_name: "navigate",
     arguments: { url: "http://localhost:3000", visible: true }
   });
   
   // Use robust selectors
   use_mcp_tool({
     server_name: "autospectra",
     tool_name: "click",
     arguments: { selector: "#login-button" }
   });
   ```

3. **Debug Issues**:
   If issues arise, switch back to Cline's browser_action for direct visual inspection.

## Session Management Across Tools

When switching between tools, remember:

1. Always close the browser with the same tool that opened it
2. Don't try to use both tools simultaneously on the same browser instance
3. For Cline's browser_action, always end with `{ action: "close" }`
4. For AutoSpectra, browsers are managed automatically between commands

## Conclusion

The combination of Cline's browser_action and AutoSpectra's MCP tools provides a powerful workflow for web development and testing. By understanding the strengths of each approach, you can create a more efficient development process that leverages the best of both worlds.
