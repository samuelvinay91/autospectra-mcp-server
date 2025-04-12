# AutoSpectra MCP Server - Current Tools List

This document provides a comprehensive reference guide to all tools currently available in the AutoSpectra MCP server.

## Browser Automation Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `navigate` | Navigate to a URL | `url` (string, required): The URL to navigate to<br>`visible` (boolean, optional): Whether to use a visible browser |
| `click` | Click on an element | `selector` (string, required): CSS selector of the element<br>`visible` (boolean, optional): Whether to use a visible browser |
| `type` | Type text into an input field | `selector` (string, required): CSS selector of the input field<br>`text` (string, required): Text to type<br>`clearFirst` (boolean, optional): Clear the field before typing<br>`visible` (boolean, optional): Whether to use a visible browser |
| `extract` | Extract data from an element | `selector` (string, required): CSS selector of the element<br>`attribute` (string, optional): Attribute to extract (default: textContent)<br>`visible` (boolean, optional): Whether to use a visible browser |
| `screenshot` | Take a screenshot | `fullPage` (boolean, optional): Whether to take a full page screenshot<br>`visible` (boolean, optional): Whether to use a visible browser |
| `check_accessibility` | Run accessibility tests | `rules` (array, optional): Specific accessibility rules to check<br>`includeHidden` (boolean, optional): Whether to include hidden elements<br>`visible` (boolean, optional): Whether to use a visible browser |

## Testing Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `generate_tests` | Generate test cases for an application | `url` (string, required): URL of the application to analyze<br>`framework` (string, optional): Test framework to use (e.g., playwright, mocha, jest)<br>`style` (string, optional): Test style (e.g., bdd, tdd)<br>`format` (string, optional): Output format (e.g., javascript, typescript)<br>`prompt` (string, required): Description of the test scenarios to generate |
| `ai_process` | Process a task with AI to generate automation steps | `task` (string, required): Task description<br>`url` (string, optional): URL context |
| `self_healing_record` | Record a test session with self-healing selectors | `url` (string, required): URL to start recording at<br>`outputFormat` (string, optional): Output format (e.g., playwright, cypress) |
| `visual_comparison` | Compare visual snapshots of a web page | `url` (string, required): URL to compare<br>`baselinePath` (string, optional): Path to baseline image<br>`threshold` (number, optional): Comparison threshold (0-1) |
| `list_frameworks` | Get a list of supported test frameworks, styles, and formats | (No parameters) |
| `run_test` | Run a generated test file | `testPath` (string, required): Path to the test file to run<br>`installDeps` (boolean, optional): Whether to install dependencies if needed |

## Debugging Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `debug_test` | Create or update a debug test session | `testName` (string, required): Name of the debug test<br>`testScript` (string, optional): JavaScript test script containing step definitions<br>`runImmediately` (boolean, optional): Whether to run the test immediately<br>`breakAt` (array, optional): Step IDs to break execution at<br>`clearPrevious` (boolean, optional): Whether to clear any previous debug session with the same name |
| `run_debug_test` | Run a debug test | `testName` (string, required): Name of the debug test to run<br>`fromStep` (number, optional): Index of the step to start execution from<br>`toStep` (number, optional): Index of the step to end execution at<br>`runToBreakpoint` (boolean, optional): Whether to pause execution at breakpoints |
| `continue_debug_test` | Continue execution of a paused debug test | `steps` (number, optional): Number of steps to execute before pausing<br>`runToBreakpoint` (boolean, optional): Whether to pause execution at breakpoints |
| `modify_debug_step` | Add or modify a step in a debug test | `stepId` (string, required): ID of the step to modify<br>`type` (string, required): Type of step (navigate, click, type, etc.)<br>`args` (object, required): Arguments for the step<br>`index` (number, optional): Index to insert the step at<br>`runAfter` (boolean, optional): Whether to run the step immediately after modification |
| `get_debug_state` | Get the current debug state | `includeStepResults` (boolean, optional): Whether to include step results in the response |
| `cleanup_debug_session` | Clean up debug session resources | (No parameters) |

## API Testing Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `api_request` | Make an HTTP request to an API endpoint | `method` (string, required): HTTP method (GET, POST, PUT, DELETE)<br>`url` (string, required): API endpoint URL<br>`headers` (object, optional): Request headers<br>`data` (any, optional): Request body<br>`params` (object, optional): URL parameters<br>`auth` (object, optional): Authentication details<br>`validateStatus` (boolean, optional): Whether to validate status code<br>`timeout` (number, optional): Request timeout<br>`baseURL` (string, optional): Base URL for relative paths<br>`ignoreHTTPSErrors` (boolean, optional): Whether to ignore HTTPS errors |
| `validate_schema` | Validate an API response against a schema | `response` (any, required): API response to validate<br>`schema` (any, optional): JSON schema to validate against<br>`schemaPath` (string, optional): Path to schema file |
| `create_mock` | Create a mock API endpoint for testing | `endpoint` (string, required): Endpoint path to mock<br>`method` (string, required): HTTP method<br>`response` (any, required): Mock response<br>`statusCode` (number, optional): Response status code |
| `graphql_request` | Make a GraphQL request | `endpoint` (string, required): GraphQL API endpoint<br>`query` (string, required): GraphQL query<br>`variables` (object, optional): Query variables<br>`headers` (object, optional): Request headers<br>`auth` (object, optional): Authentication details |

## Computer Use Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `initialize_computer` | Initialize a computer use provider | `type` (string, required): Provider type ("api" or "container")<br>`apiKey` (string, optional): Anthropic API key<br>`containerImage` (string, optional): Container image to use<br>`width` (number, optional): Screen width for container provider<br>`height` (number, optional): Screen height for container provider |
| `use_computer` | Use Claude computer capabilities | `prompt` (string, required): Description of the computer task to perform<br>`model` (string, optional): Claude model to use |
| `smart_computer_use` | Use computer capabilities with fallback to automation tools | `prompt` (string, required): Description of the computer task to perform<br>`useAutomation` (boolean, optional): Whether to fall back to automation tools<br>`model` (string, optional): Claude model to use |
| `cleanup_computer` | Clean up computer use provider resources | (No parameters) |

## Usage Examples

### Browser Automation

```javascript
// Navigate to a URL with visible browser
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: {
    url: "https://example.com",
    visible: true
  }
});

// Click on an element
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "click",
  arguments: {
    selector: "#login-button",
    visible: true
  }
});

// Type text into a field
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

### Testing

```javascript
// Generate tests for a login page
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "generate_tests",
  arguments: {
    url: "https://example.com/login",
    framework: "playwright",
    format: "javascript",
    prompt: "Create tests for login functionality, including valid and invalid credentials"
  }
});

// Run the generated test
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "run_test",
  arguments: {
    testPath: "./output/login-tests.js",
    installDeps: true
  }
});
```

### Debugging

```javascript
// Create a debug test session
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "debug_test",
  arguments: {
    testName: "login-flow",
    testScript: `
      // Simple login flow test
      step('step1', 'navigate', { url: 'https://example.com/login' });
      step('step2', 'type', { selector: '#username', text: 'testuser', clearFirst: true });
      step('step3', 'type', { selector: '#password', text: 'password123', clearFirst: true });
      step('step4', 'click', { selector: '#login-button' });
      step('step5', 'extract', { selector: '.welcome-message' });
    `,
    breakAt: ['step4'],
    runImmediately: false
  }
});

// Run the debug test
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "run_debug_test",
  arguments: {
    testName: "login-flow",
    runToBreakpoint: true
  }
});
```

### API Testing

```javascript
// Make a GET request
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "api_request",
  arguments: {
    method: "GET",
    url: "https://api.example.com/users",
    headers: {
      "Accept": "application/json"
    }
  }
});

// Make a POST request with JSON data
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "api_request",
  arguments: {
    method: "POST",
    url: "https://api.example.com/users",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
});

// Validate response against schema
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "validate_schema",
  arguments: {
    response: {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    schema: {
      "type": "object",
      "required": ["id", "name", "email"],
      "properties": {
        "id": { "type": "number" },
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      }
    }
  }
});
```

### Computer Use

```javascript
// Initialize computer use
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "initialize_computer",
  arguments: {
    type: "api"
  }
});

// Use computer capabilities
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "use_computer",
  arguments: {
    prompt: "Open a web browser, navigate to example.com, and take a screenshot"
  }
});
```

## Integration with CI/CD

The AutoSpectra MCP server can be integrated into CI/CD pipelines to provide automated testing capabilities. For more information, see the [CLOUD_DEPLOYMENT.md](guides/deployment/CLOUD_DEPLOYMENT.md) guide.

## Next Steps

For more detailed information about specific tools and capabilities, refer to:

- [USAGE_GUIDE.md](api/tools/USAGE_GUIDE.md) for detailed tool usage instructions
- [LIVE_DEBUGGING.md](guides/LIVE_DEBUGGING.md) for debugging workflows
- [COMPUTER_USE.md](guides/computer-use/COMPUTER_USE.md) for Claude Computer Use integration
