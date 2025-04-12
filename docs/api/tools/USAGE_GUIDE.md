# AutoSpectra MCP Server Usage Guide

This guide demonstrates how to use the AutoSpectra MCP server's browser automation tools, including the newly added visible browser capabilities. These tools can be used in coordination with Cline's browser_action tools to create powerful development, testing, and automation workflows.

## Browser Automation Tools

The AutoSpectra MCP server provides the following browser automation tools:

| Tool | Description | Visible Mode Support |
|------|-------------|----------------------|
| `navigate` | Navigate to a URL | ✅ |
| `click` | Click on an element | ✅ |
| `type` | Type text into an input field | ✅ |
| `extract` | Extract data from an element | ✅ |
| `screenshot` | Take a screenshot | ✅ |
| `checkAccessibility` | Run accessibility tests | ✅ |

All these tools now support a `visible` parameter that, when set to `true`, will force the browser to be visible regardless of the configuration settings.

## Basic Usage Examples

### Navigate to a URL with Visible Browser

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: {
    url: "https://www.example.com",
    visible: true
  }
});
```

### Click on an Element with Visible Browser

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "click",
  arguments: {
    selector: "#login-button",
    visible: true
  }
});
```

### Type Text with Visible Browser

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "type",
  arguments: {
    selector: "#username",
    text: "testuser",
    clearFirst: true,
    visible: true
  }
});
```

### Extract Data with Visible Browser

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "extract",
  arguments: {
    selector: ".result-message",
    attribute: "textContent",
    visible: true
  }
});
```

### Take a Screenshot with Visible Browser

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "screenshot",
  arguments: {
    fullPage: true,
    visible: true
  }
});
```

### Run Accessibility Tests with Visible Browser

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "checkAccessibility",
  arguments: {
    includeHidden: false,
    visible: true
  }
});
```

## Coordinated Workflows with Cline's browser_action

You can create powerful workflows that combine AutoSpectra's MCP tools with Cline's browser_action:

### Example Workflow: Form Testing

```javascript
// First, use Cline's browser_action for exploratory testing
browser_action({ action: "launch", url: "http://localhost:3000/login" });
browser_action({ action: "click", coordinate: "450,300" }); // Click on the form
browser_action({ action: "close" });

// Then, use AutoSpectra's MCP tools for automated testing
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: { url: "http://localhost:3000/login", visible: true }
});

use_mcp_tool({
  server_name: "autospectra",
  tool_name: "type", 
  arguments: { 
    selector: "#username", 
    text: "testuser", 
    clearFirst: true,
    visible: true
  }
});

use_mcp_tool({
  server_name: "autospectra",
  tool_name: "type", 
  arguments: { 
    selector: "#password", 
    text: "password123", 
    clearFirst: true,
    visible: true
  }
});

use_mcp_tool({
  server_name: "autospectra",
  tool_name: "click", 
  arguments: { 
    selector: "#login-button",
    visible: true
  }
});

// Extract the result message
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "extract", 
  arguments: { 
    selector: ".result-message",
    visible: true
  }
});
```

## Best Practices

1. **Start with visible browsers for debugging**: When developing or debugging, use `visible: true` to see what's happening in real-time.

2. **Switch to headless for production**: Once your automation is stable, you can remove the `visible` parameter for faster, headless execution.

3. **Combine with Cline's browser_action**: Use Cline's browser_action for exploratory testing and AutoSpectra's MCP tools for programmatic testing.

4. **Session management**: Remember that browser sessions are managed automatically between MCP tool calls, but you should close browser_action sessions explicitly.

5. **Self-healing selectors**: Take advantage of AutoSpectra's self-healing selectors for more robust automation compared to coordinate-based clicks.

## Troubleshooting

If you encounter issues with visible browsers:

1. Check the `.env` file to ensure `HEADLESS=false` is set.
2. Verify that the server has been rebuilt with `npm run build` after making changes.
3. Ensure the server is running with `npm start` before attempting to use the tools.
4. Look for console logs that include `[DEBUG]` and `[INFO]` messages about the headless setting.

## Next Steps

For more information about the different browser automation approaches and how they work together, refer to these additional documents:

- [CLINE_BROWSER_INTEGRATION.md](CLINE_BROWSER_INTEGRATION.md)
- [DESKTOP_VS_API_BROWSER.md](DESKTOP_VS_API_BROWSER.md)
- [CURRENT_BROWSER_SETUP.md](CURRENT_BROWSER_SETUP.md)
- [VISIBLE_BROWSER_INTEGRATION.md](VISIBLE_BROWSER_INTEGRATION.md)
