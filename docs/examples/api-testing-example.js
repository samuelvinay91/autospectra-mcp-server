/**
 * AutoSpectra MCP Server - API Testing Example
 * 
 * This example demonstrates how to use the API testing tools to:
 * 1. Make API requests
 * 2. Validate responses against schemas
 * 3. Work with GraphQL APIs
 * 4. Create and use mock endpoints
 */

// Import required libraries
const { expect } = require('chai');

describe('API Testing Examples', () => {
  // Sample user data for testing
  const testUser = {
    name: 'Jane Smith',
    email: 'jane.smith@example.com'
  };

  // Example JSON Schema for user validation
  const userSchema = {
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  };

  /**
   * Example 1: Basic API Request
   * Demonstrates making a GET request and checking the response
   */
  it('should fetch a list of users', async () => {
    // Make a GET request to a users endpoint
    const response = await use_mcp_tool({
      server_name: 'autospectra',
      tool_name: 'api_request',
      arguments: {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          'Accept': 'application/json'
        },
        params: {
          'limit': '10'
        }
      }
    });

    // Get response JSON data
    const responseData = JSON.parse(response.content[0].text.split('Response: ')[1]);
    
    // Verify response has expected properties
    expect(responseData).to.be.an('array');
    expect(responseData.length).to.be.lessThanOrEqual(10);
    
    if (responseData.length > 0) {
      expect(responseData[0]).to.have.property('id');
      expect(responseData[0]).to.have.property('name');
      expect(responseData[0]).to.have.property('email');
    }
  });

  /**
   * Example 2: POST Request with JSON Body
   * Demonstrates creating a new resource
   */
  it('should create a new user', async () => {
    // Make a POST request to create a user
    const response = await use_mcp_tool({
      server_name: 'autospectra',
      tool_name: 'api_request',
      arguments: {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: testUser
      }
    });

    // Get response JSON data
    const responseData = JSON.parse(response.content[0].text.split('Response: ')[1]);
    
    // Verify the user was created with expected data
    expect(responseData).to.have.property('id');
    expect(responseData.name).to.equal(testUser.name);
    expect(responseData.email).to.equal(testUser.email);
    
    // Store user ID for later tests
    const userId = responseData.id;
    
    return userId;
  });

  /**
   * Example 3: Schema Validation
   * Demonstrates validating an API response against a JSON Schema
   */
  it('should validate user schema', async () => {
    // First create a user
    const createResponse = await use_mcp_tool({
      server_name: 'autospectra',
      tool_name: 'api_request',
      arguments: {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json'
        },
        data: testUser
      }
    });
    
    const userData = JSON.parse(createResponse.content[0].text.split('Response: ')[1]);
    
    // Validate the response against our schema
    const validation = await use_mcp_tool({
      server_name: 'autospectra',
      tool_name: 'validate_schema',
      arguments: {
        response: userData,
        schema: userSchema
      }
    });
    
    // Check that validation passed
    expect(validation.content[0].text).to.equal('Schema validation passed successfully');
  });

  /**
   * Example 4: GraphQL API Test
   * Demonstrates making a GraphQL query
   */
  it('should query user data via GraphQL', async () => {
    // Make a GraphQL request
    const response = await use_mcp_tool({
      server_name: 'autospectra',
      tool_name: 'graphql_request',
      arguments: {
        endpoint: 'https://api.example.com/graphql',
        query: `
          query GetUsers($limit: Int) {
            users(limit: $limit) {
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
          limit: 5
        }
      }
    });
    
    // Get response JSON data
    const responseData = JSON.parse(response.content[0].text.split('Response: ')[1]);
    
    // Verify GraphQL response structure
    expect(responseData).to.have.property('data');
    expect(responseData.data).to.have.property('users');
    expect(responseData.data.users).to.be.an('array');
    
    if (responseData.data.users.length > 0) {
      const user = responseData.data.users[0];
      expect(user).to.have.property('id');
      expect(user).to.have.property('name');
      expect(user).to.have.property('email');
      expect(user).to.have.property('posts');
      expect(user.posts).to.be.an('array');
    }
  });

  /**
   * Example 5: Using Mock API
   * Demonstrates creating and using a mock API endpoint
   */
  it('should create and use a mock API', async () => {
    // Create mock data
    const mockUsers = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ];
    
    // Create a mock API endpoint
    await use_mcp_tool({
      server_name: 'autospectra',
      tool_name: 'create_mock',
      arguments: {
        endpoint: '/api/users',
        method: 'GET',
        response: { users: mockUsers },
        statusCode: 200
      }
    });
    
    // Use the mock API endpoint
    // In a real implementation, you would make a request to the mock server URL
    console.log('Mock API created - in a full implementation, you would now be able to make requests to this mock endpoint');
    
    // Typically, you would then make a request like:
    // const mockResponse = await use_mcp_tool({
    //   server_name: 'autospectra',
    //   tool_name: 'api_request',
    //   arguments: {
    //     method: 'GET',
    //     url: 'http://mock-server/api/users'
    //   }
    // });
  });
});
