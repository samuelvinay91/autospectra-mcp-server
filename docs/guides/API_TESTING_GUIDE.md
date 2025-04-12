# API Testing with AutoSpectra MCP Server

This guide covers how to use the newly added API testing capabilities in the AutoSpectra MCP server.

## Available API Testing Tools

The AutoSpectra MCP server now includes powerful API testing tools:

| Tool | Description |
|------|-------------|
| `api_request` | Make HTTP requests to API endpoints with full control over method, headers, data, etc. |
| `validate_schema` | Validate API responses against JSON schemas |
| `create_mock` | Create mock API endpoints for testing purposes |
| `graphql_request` | Make specialized GraphQL API requests |

## Using the API Testing Tools

### Making HTTP Requests

The `api_request` tool allows you to make HTTP requests to any API endpoint:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "api_request",
  arguments: {
    method: "GET",
    url: "https://api.example.com/users",
    headers: {
      "Accept": "application/json"
    },
    params: {
      "limit": "10"
    }
  }
});
```

For POST requests with a JSON body:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "api_request",
  arguments: {
    method: "POST",
    url: "https://api.example.com/users",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    data: {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
});
```

With authentication:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "api_request",
  arguments: {
    method: "GET",
    url: "https://api.example.com/protected-resource",
    auth: {
      type: "bearer",
      token: "your-access-token"
    }
  }
});
```

### Schema Validation

Validate API responses against JSON schemas to ensure they match expected formats:

```javascript
// First get a response from an API
const apiResponse = await use_mcp_tool({
  server_name: "autospectra",
  tool_name: "api_request",
  arguments: {
    method: "GET",
    url: "https://api.example.com/users/1"
  }
});

// Then validate it against a schema
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "validate_schema",
  arguments: {
    response: apiResponse.content[0].text,
    schema: {
      type: "object",
      required: ["id", "name", "email"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        email: { type: "string", format: "email" }
      }
    }
  }
});
```

You can also validate against a schema file:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "validate_schema",
  arguments: {
    response: apiResponse.content[0].text,
    schemaPath: "./schemas/user-schema.json"
  }
});
```

### Creating Mocks

Create mock API endpoints for testing. This is useful when the real API is unavailable or you want to test specific scenarios:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "create_mock",
  arguments: {
    endpoint: "/api/users",
    method: "GET",
    response: {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" }
      ]
    },
    statusCode: 200
  }
});
```

### GraphQL Requests

Make GraphQL requests with support for variables:

```javascript
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "graphql_request",
  arguments: {
    endpoint: "https://api.example.com/graphql",
    query: `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
          posts {
            id
            title
          }
        }
      }
    `,
    variables: {
      id: "user-123"
    },
    headers: {
      "Authorization": "Bearer your-token"
    }
  }
});
```

## Integrating with Test Generation

You can combine API testing with test generation to create comprehensive API test suites:

```javascript
// Generate API tests for a specific endpoint
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "generate_tests",
  arguments: {
    url: "https://api.example.com",
    framework: "mocha",
    format: "javascript",
    prompt: "Create API tests for the user management endpoints: GET /users, POST /users, GET /users/:id"
  }
});
```

## End-to-End Testing with API and UI

Combine API testing with browser automation for comprehensive end-to-end testing:

```javascript
// Reset user data via API
await use_mcp_tool({
  server_name: "autospectra",
  tool_name: "api_request",
  arguments: {
    method: "POST",
    url: "https://example.com/api/reset-data",
    data: { resetUsers: true }
  }
});

// Then perform UI testing
await use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: {
    url: "https://example.com/login",
    visible: true
  }
});

// Fill in login form
await use_mcp_tool({
  server_name: "autospectra",
  tool_name: "type",
  arguments: {
    selector: "#username",
    text: "testuser",
    clearFirst: true
  }
});

// ...and so on
```

## Best Practices

1. **Store credentials securely**: Never hardcode API tokens. Use environment variables or secure storage.

2. **Validate response schemas**: Always validate API responses against schemas to catch breaking changes.

3. **Clean up after tests**: If your tests create data, ensure you have cleanup procedures.

4. **Use mocks for unavailable services**: Create mock endpoints for third-party services that aren't available in test environments.

5. **Combine API and UI testing**: For full end-to-end tests, use API calls to set up test data, then UI automation to test the frontend.

## Troubleshooting

- **Connection issues**: Check network connectivity and ensure the API endpoint is correct.
- **Authentication errors**: Verify your authentication credentials and token expiration.
- **Schema validation failures**: Compare the actual response with your schema to identify mismatches.
- **Mock endpoint errors**: Ensure you've provided the correct endpoint path and method for your mock.

## Next Steps

For more advanced API testing, consider:

- Creating reusable test data setup and teardown functions
- Setting up a CI/CD pipeline with API tests
- Creating a library of common API testing patterns for your team
