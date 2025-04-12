# Smithery AI Integration Guide for AutoSpectra MCP Server

[![smithery badge](https://smithery.ai/badge/@samuelvinay91/autospectra-mcp-server)](https://smithery.ai/server/@samuelvinay91/autospectra-mcp-server)

This guide provides detailed instructions for integrating AutoSpectra MCP Server with Smithery AI, allowing AI agents to leverage advanced browser automation and testing capabilities.

## Overview

Smithery AI is a platform that allows the creation of AI agents with tool-use capabilities. By integrating AutoSpectra MCP Server, these agents gain access to visible browser automation, test generation, accessibility testing, and more.

## Integration Steps

### 1. Prepare AutoSpectra MCP Server

First, ensure your AutoSpectra MCP Server is properly set up and working:

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/autospectra/autospectra-mcp-server.git
cd autospectra-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Test the Server Locally

Before integrating with Smithery AI, verify that your server works correctly:

```bash
# Run the server
node build/index.js
```

The server should start without errors and be ready to handle MCP requests.

### 3. Create a Smithery AI Account

If you don't already have one, [create a Smithery AI account](https://smithery.ai/signup).

### 4. Set Up a New AI Agent in Smithery

1. Log in to your Smithery AI dashboard
2. Click "Create New Agent" or navigate to your existing agent
3. Go to the "Tools" section

### 5. Add AutoSpectra as an External Tool

In the Smithery AI dashboard:

1. Navigate to "Settings" > "Integrations" > "Add Custom Tool"
2. Fill in the required information:

```
Name: autospectra
Display Name: AutoSpectra Browser Automation
Description: Browser automation and testing with visible feedback
```

### 6. Configure the Tool Endpoint

There are two options for configuring the endpoint:

#### Option A: Local Deployment (Development)

For local testing, you can expose your local server using a service like ngrok:

```bash
# Install ngrok if you don't have it
npm install -g ngrok

# Expose your local server
ngrok http 3000
```

Use the provided ngrok URL as your endpoint in Smithery AI.

#### Option B: Cloud Deployment (Production)

For production use, deploy the AutoSpectra MCP Server to a cloud provider:

1. **Deploy to a cloud provider** (AWS, Azure, GCP, etc.)
2. Set up environment variables in your cloud environment:
   ```
   DEBUG=true
   HEADLESS=false
   SLOW_MO=500
   ```
3. Use the deployed URL as your endpoint in Smithery AI

### 7. Define Tool Schemas in Smithery AI

For each tool you want to expose to your Smithery AI agent, define the input schema:

#### Navigate Tool

```json
{
  "name": "navigate",
  "description": "Navigate to a URL",
  "parameters": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "URL to navigate to"
      }
    },
    "required": ["url"]
  }
}
```

#### Click Tool

```json
{
  "name": "click",
  "description": "Click on an element",
  "parameters": {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "CSS selector of the element"
      }
    },
    "required": ["selector"]
  }
}
```

#### Type Tool

```json
{
  "name": "type",
  "description": "Type text into an input field",
  "parameters": {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "CSS selector of the input field"
      },
      "text": {
        "type": "string",
        "description": "Text to type"
      },
      "clearFirst": {
        "type": "boolean",
        "description": "Clear the field before typing"
      }
    },
    "required": ["selector", "text"]
  }
}
```

#### Extract Tool

```json
{
  "name": "extract",
  "description": "Extract data from an element",
  "parameters": {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "CSS selector of the element"
      },
      "attribute": {
        "type": "string",
        "description": "Attribute to extract (default: textContent)"
      }
    },
    "required": ["selector"]
  }
}
```

#### Screenshot Tool

```json
{
  "name": "screenshot",
  "description": "Take a screenshot",
  "parameters": {
    "type": "object",
    "properties": {
      "fullPage": {
        "type": "boolean",
        "description": "Whether to take a full page screenshot"
      }
    }
  }
}
```

#### Check Accessibility Tool

```json
{
  "name": "check_accessibility",
  "description": "Run accessibility tests on the current page",
  "parameters": {
    "type": "object",
    "properties": {
      "rules": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Specific accessibility rules to check"
      },
      "includeHidden": {
        "type": "boolean",
        "description": "Whether to include hidden elements in the test"
      }
    }
  }
}
```

#### API Request Tool

```json
{
  "name": "api_request",
  "description": "Make an HTTP request to an API endpoint",
  "parameters": {
    "type": "object",
    "properties": {
      "method": {
        "type": "string",
        "description": "HTTP method (GET, POST, PUT, DELETE, etc.)"
      },
      "url": {
        "type": "string",
        "description": "API endpoint URL"
      },
      "headers": {
        "type": "object",
        "description": "Request headers"
      },
      "data": {
        "type": "object",
        "description": "Request body data"
      },
      "params": {
        "type": "object",
        "description": "URL parameters"
      },
      "auth": {
        "type": "object",
        "description": "Authentication details"
      },
      "validateStatus": {
        "type": "boolean",
        "description": "Whether to validate the status code"
      },
      "timeout": {
        "type": "number",
        "description": "Request timeout in milliseconds"
      }
    },
    "required": ["method", "url"]
  }
}
```

#### Validate Schema Tool

```json
{
  "name": "validate_schema",
  "description": "Validate an API response against a JSON schema",
  "parameters": {
    "type": "object",
    "properties": {
      "response": {
        "type": "object",
        "description": "API response to validate"
      },
      "schema": {
        "type": "object",
        "description": "JSON schema to validate against"
      },
      "schemaPath": {
        "type": "string",
        "description": "Path to schema file"
      }
    },
    "required": ["response"]
  }
}
```

#### Create Mock Tool

```json
{
  "name": "create_mock",
  "description": "Create a mock API endpoint for testing",
  "parameters": {
    "type": "object",
    "properties": {
      "endpoint": {
        "type": "string",
        "description": "Endpoint path to mock"
      },
      "method": {
        "type": "string",
        "description": "HTTP method"
      },
      "response": {
        "type": "object",
        "description": "Mock response"
      },
      "statusCode": {
        "type": "number",
        "description": "Response status code"
      }
    },
    "required": ["endpoint", "method", "response"]
  }
}
```

#### GraphQL Request Tool

```json
{
  "name": "graphql_request",
  "description": "Make a GraphQL request",
  "parameters": {
    "type": "object",
    "properties": {
      "endpoint": {
        "type": "string",
        "description": "GraphQL API endpoint"
      },
      "query": {
        "type": "string",
        "description": "GraphQL query"
      },
      "variables": {
        "type": "object",
        "description": "Query variables"
      },
      "headers": {
        "type": "object",
        "description": "Request headers"
      },
      "auth": {
        "type": "object",
        "description": "Authentication details"
      }
    },
    "required": ["endpoint", "query"]
  }
}
```

#### Generate Tests Tool

```json
{
  "name": "generate_tests",
  "description": "Generate test cases for an application",
  "parameters": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "URL of the application to analyze"
      },
      "framework": {
        "type": "string",
        "description": "Test framework to use (e.g., playwright, mocha, jest)"
      },
      "style": {
        "type": "string",
        "description": "Test style (e.g., bdd, tdd)"
      },
      "format": {
        "type": "string",
        "description": "Output format (e.g., javascript, typescript)"
      },
      "prompt": {
        "type": "string",
        "description": "Description of the test scenarios to generate"
      }
    },
    "required": ["url", "prompt"]
  }
}
```

### 8. Test the Integration

Once configured, test the integration by asking your Smithery AI agent to perform a simple browser automation task:

Example prompt:
```
Navigate to https://example.com and take a screenshot
```

The agent should use the AutoSpectra tools to navigate to the URL and capture a screenshot, returning the results to you.

### 9. Advanced Configuration for Smithery AI

Smithery AI offers advanced configuration options that can enhance the AutoSpectra integration:

#### Persistent Browser Sessions

To maintain browser state between tool calls:

```json
{
  "sessionPersistence": true,
  "sessionTimeout": 300
}
```

#### Custom Tool Permissions

Restrict which tools the agent can use without user confirmation:

```json
{
  "toolPermissions": {
    "navigate": "auto",
    "screenshot": "auto",
    "extract": "auto",
    "click": "confirm",
    "type": "confirm"
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Ensure your MCP server is running and accessible from the internet
   - Check firewall settings if using a cloud deployment

2. **Browser Visibility Issues**:
   - Confirm `HEADLESS=false` is set in your environment variables
   - Some cloud environments may require additional configuration for display

3. **Tool Not Found Errors**:
   - Verify that the tool names in Smithery AI exactly match those defined in AutoSpectra

4. **Performance Issues**:
   - Consider adjusting the `SLOW_MO` setting for better performance vs. visibility tradeoff

### Reporting Problems

If you encounter issues with the integration, please:

1. Check the AutoSpectra server logs for error messages
2. Review the Smithery AI execution logs for the specific agent
3. Report issues on the [AutoSpectra GitHub repository](https://github.com/autospectra/autospectra-mcp-server/issues) with detailed reproduction steps

## Security Considerations

When integrating with Smithery AI, consider the following security aspects:

1. **Authentication**: Implement authentication for your deployed AutoSpectra server
2. **API Rate Limiting**: Consider rate limiting to prevent abuse
3. **Browser Sandbox**: Ensure your deployment environment properly sandboxes browser instances
4. **Data Privacy**: Be aware of what data might be processed through the integration

## Next Steps

After successfully integrating with Smithery AI, consider:

1. Creating specialized AI agents for different testing scenarios
2. Developing custom prompt templates for common test activities
3. Setting up scheduled automated tests using the Smithery AI API
4. Integrating test results with your existing reporting systems

For more information, refer to the [AutoSpectra full documentation](../README.md) and the [Smithery AI API documentation](https://docs.smithery.ai).
