# Live Debugging Tests Directly from Cline

This guide demonstrates how to use the new interactive debugging capabilities in AutoSpectra MCP server directly from Cline. These tools allow you to create, run, and debug browser automation tests without leaving Cline or needing any external tools.

## Overview of Debug Tools

The AutoSpectra MCP server now includes a full suite of interactive debugging tools:

| Tool | Purpose |
|------|---------|
| `debug_test` | Create or update a test session with a JavaScript test script |
| `run_debug_test` | Execute a test with step-by-step control |
| `continue_debug_test` | Resume execution of a paused test |
| `modify_debug_step` | Add or modify test steps during execution |
| `get_debug_state` | Get the current state including execution logs and screenshots |
| `cleanup_debug_session` | Clean up resources when done |

## Step-by-Step Debugging Workflow

Here's how to use these tools directly within Cline:

### 1. Initialize a Debug Test Session

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "debug_test",
  arguments: {
    testName: "my-test",
    testScript: `
      // Helper function to define steps
      function step(id, type, args) {
        return { id, type, args };
      }
      
      // Define test steps
      step('step1', 'navigate', { url: 'https://example.com' });
      step('step2', 'extract', { selector: 'h1', attribute: 'textContent' });
    `,
    breakAt: ["step2"],  // Set breakpoints
    runImmediately: false
  }
});
```

### 2. Run the Test

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "run_debug_test",
  arguments: {
    testName: "my-test"
  }
});
```

### 3. Inspect the Current State

When the test pauses at a breakpoint, inspect the current state:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "get_debug_state",
  arguments: {
    includeStepResults: true
  }
});
```

### 4. Modify a Step at Runtime

You can modify steps on the fly during debugging:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "modify_debug_step",
  arguments: {
    stepId: "step2",
    type: "extract",
    args: {
      selector: "p",
      attribute: "textContent"
    }
  }
});
```

### 5. Continue Execution

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "continue_debug_test",
  arguments: {
    runToBreakpoint: true
  }
});
```

### 6. Add a New Step During Debugging

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "modify_debug_step",
  arguments: {
    stepId: "new-step",
    type: "screenshot",
    args: {
      fullPage: true
    },
    runAfter: true  // Run this step immediately
  }
});
```

### 7. Clean Up When Done

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "cleanup_debug_session",
  arguments: {}
});
```

## Complete Example Walkthrough

Let's walk through a complete debugging session:

### Creating a Test

1. First, initialize a debug session with a test script:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "debug_test",
  arguments: {
    testName: "login-test",
    testScript: `
      // Define test steps with the step helper function
      function step(id, type, args) {
        return { id, type, args };
      }
      
      // Navigate to the login page
      step('start', 'navigate', { url: 'https://example.com/login' });
      
      // Fill in the username field
      step('username', 'type', { 
        selector: '#username', 
        text: 'testuser' 
      });
      
      // Fill in the password field
      step('password', 'type', { 
        selector: '#password', 
        text: 'password123' 
      });
      
      // Click the login button
      step('submit', 'click', { 
        selector: '#login-button' 
      });
      
      // Check for successful login
      step('verify', 'assert', {
        assertion: "document.querySelector('.welcome-message') !== null",
        message: 'Should show welcome message after login'
      });
      
      // Take a screenshot of the result
      step('screenshot', 'screenshot', { fullPage: true });
    `,
    breakAt: ["username", "verify"],
    runImmediately: false
  }
});
```

2. Run the test:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "run_debug_test",
  arguments: {
    testName: "login-test"
  }
});
```

3. If we encounter an issue - for example, the selector for the username field is incorrect - we can fix it at runtime:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "modify_debug_step",
  arguments: {
    stepId: "username",
    type: "type",
    args: {
      selector: ".username-input", // Updated selector
      text: "testuser"
    }
  }
});
```

4. Continue to the next breakpoint:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "continue_debug_test",
  arguments: {}
});
```

5. Add a new step to check something we just realized we need:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "modify_debug_step",
  arguments: {
    stepId: "check-url",
    type: "execute",
    args: {
      code: "return { currentUrl: window.location.href };"
    },
    index: 4, // Insert before verification
    runAfter: true
  }
});
```

6. Complete the test:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "continue_debug_test",
  arguments: {}
});
```

7. Finally, clean up:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "cleanup_debug_session",
  arguments: {}
});
```

## Supported Step Types

The debugging framework supports a variety of step types:

| Step Type | Description | Key Parameters |
|-----------|-------------|----------------|
| `navigate` | Navigate to a URL | `url` |
| `click` | Click on an element | `selector` |
| `type` | Type text into a field | `selector`, `text` |
| `extract` | Extract data from elements | `selector`, `attribute` |
| `screenshot` | Take a screenshot | `fullPage` |
| `wait` | Wait for a duration | `ms` |
| `assert` | Verify a condition | `assertion`, `message` |
| `execute` | Run custom JavaScript code | `code` |

## Practical Tips

1. **Breakpoints at Critical Points**: Set breakpoints before critical actions like form submissions to verify the state.

2. **Fixing Selectors**: When a selector doesn't work, pause at a breakpoint, then use `modify_debug_step` to fix it.

3. **Adding Verification Steps**: Add assertion steps during debugging when you discover edge cases.

4. **Visual Debugging**: Use screenshot steps liberally to capture the visual state at different points.

5. **Custom Logic**: Use the `execute` step type to run arbitrary JavaScript for complex verification or manipulation.

## Sample Debuggable Test File

For a ready-to-use example, see the sample test file at `output/debug/sample-debug-test.js`.

This file contains a complete test with step definitions and instructions for executing it through Cline.

## Advantages over Traditional Debugging

This approach has several advantages:

1. **No Context Switching**: Debug entirely within Cline without switching to an IDE
2. **Real-time Updates**: Modify tests on-the-fly during execution
3. **Visual Feedback**: See the browser state with screenshots
4. **State Inspection**: Examine test state at any breakpoint
5. **Iterative Development**: Perfect tests by debugging them step-by-step

With these tools, you can develop, debug, and perfect browser automation tests without ever leaving the Cline interface!
