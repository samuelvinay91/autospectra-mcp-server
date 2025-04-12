# AI Agent Computer Use Integration with AutoSpectra MCP Server

This document explains how Computer Use capabilities are integrated with the AutoSpectra MCP Server and important limitations to be aware of. While initially developed for Claude, our implementation is designed to work with any AI agent supporting the MCP protocol.

## Overview

The Computer Use capabilities allow AI agents to use a virtual computer, including:
- Running applications
- Navigating web browsers
- Creating and editing files
- Taking screenshots
- Running command-line tools

This functionality is integrated with the AutoSpectra MCP server to provide these capabilities through MCP tools.

## Important Limitations

### Virtual Environment vs. Local Machine

**Critical Limitation**: When Claude uses its Computer Use capabilities, it operates in a sandboxed virtual environment provided by Anthropic, **not on your local machine**.

- The browser, filesystem, and applications are all within Claude's virtual environment
- Changes made in this environment (like creating files) do not affect your actual computer
- Screenshots taken show Claude's virtual desktop, not your real desktop
- You cannot see the browser being opened or interact with it directly

This is different from the AutoSpectra browser automation tools like `browser_action`, which control a browser on your local machine.

## Integration Architecture

The integration consists of two main components:

1. **API Provider**: Communicates with Anthropic's API to access Computer Use capabilities
2. **MCP Tools**: Exposes the functionality through standardized MCP tools

### Available MCP Tools

1. `initialize_computer`: Sets up the Computer Use provider
   ```javascript
   await use_mcp_tool({
     server_name: "autospectra",
     tool_name: "initialize_computer",
     arguments: {
       type: "api",
       apiKey: "your-anthropic-api-key",
       model: "claude-3-7-sonnet-20250219" // Optional
     }
   });
   ```

2. `use_computer`: Sends a task to Claude's computer use capabilities
   ```javascript
   await use_mcp_tool({
     server_name: "autospectra",
     tool_name: "use_computer",
     arguments: {
       prompt: "Create a text file named test.txt with content 'Hello World'",
       model: "claude-3-7-sonnet-20250219" // Optional
     }
   });
   ```

## Technical Implementation Details

### Tool Version Compatibility

- Claude 3.7 Sonnet requires all tools to use version `20250124`
- Claude 3.5 Sonnet requires all tools to use version `20241022`

Using mismatched tool versions will result in API errors.

### Thinking Feature

- Claude 3.7 models support the "thinking" capability
- When thinking is enabled, `max_tokens` must exceed `thinking.budget_tokens`
- Default thinking budget is 1024 tokens

## Testing

We've created test scripts to verify functionality:

1. `test-claude-integration.js`: Tests basic file creation
2. `test-browser-navigation.js`: Tests browser navigation to example.com

Limitations of testing:
- You cannot directly observe the browser being opened in Claude's virtual environment
- The test scripts can only show Claude's text responses and tool use actions
- Screenshots taken exist only in the virtual environment

## Future Improvements

Potential future enhancements:
1. Add support for container-based environments
2. Improve visualization of Computer Use activities
3. Save screenshots from virtual environment to local disk
4. Improved error reporting and recovery

## Troubleshooting

Common issues:
1. "Invalid tool type" errors: Check that all tools use matching versions
2. Authentication failures: Verify API key has Computer Use access
3. "Max tokens must be greater than thinking.budget_tokens": Increase max_tokens setting
4. "Unable to see browser opening": Remember this happens in Claude's virtual environment only
