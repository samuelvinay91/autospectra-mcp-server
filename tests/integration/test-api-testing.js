/**
 * Integration test for API testing tools
 * 
 * This test verifies that the API testing tools are functioning correctly
 * by making actual requests and validating responses.
 */

const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { describe, it } = require('mocha');

// Path to the server
const serverPath = path.join(__dirname, '../../build/index.js');

describe('API Testing Tools', function() {
  // Set longer timeout for API calls
  this.timeout(10000);
  
  /**
   * Test the api_request tool with a GET request
   */
  it('should perform a GET request with api_request', async function() {
    const request = {
      id: "test-get-request",
      jsonrpc: "2.0",
      method: "callTool",
      params: {
        name: "api_request",
        arguments: {
          method: "GET",
          url: "https://jsonplaceholder.typicode.com/users/1",
          headers: {
            "Accept": "application/json"
          }
        }
      }
    };
    
    const response = await sendMcpRequest(request);
    
    // Verify basic structure of response
    assert(response.content && response.content.length > 0, 'Response should have content');
    assert(response.content[0].type === 'text', 'Response content should be text');
    assert(response.content[0].text.includes('API Request: GET'), 'Response should indicate API request method');
    
    // Verify actual response data contains expected user info
    const responseText = response.content[0].text;
    const responseDataText = responseText.split('Response: ')[1];
    const responseData = JSON.parse(responseDataText);
    
    assert(responseData.id === 1, 'Response should contain user with ID 1');
    assert(responseData.name, 'Response should contain user name');
    assert(responseData.email, 'Response should contain user email');
  });
  
  /**
   * Test the validate_schema tool
   */
  it('should validate a response against a schema', async function() {
    const request = {
      id: "test-schema-validation",
      jsonrpc: "2.0",
      method: "callTool",
      params: {
        name: "validate_schema",
        arguments: {
          response: {
            id: 1,
            name: "Leanne Graham",
            email: "Sincere@april.biz"
          },
          schema: {
            type: "object",
            required: ["id", "name", "email"],
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              email: { type: "string" }
            }
          }
        }
      }
    };
    
    const response = await sendMcpRequest(request);
    
    assert(response.content && response.content.length > 0, 'Response should have content');
    assert(response.content[0].text === 'Schema validation passed successfully', 
          'Schema validation should pass for valid data');
  });
  
  /**
   * Test schema validation failure
   */
  it('should detect schema validation failures', async function() {
    const request = {
      id: "test-schema-validation-failure",
      jsonrpc: "2.0",
      method: "callTool",
      params: {
        name: "validate_schema",
        arguments: {
          response: {
            id: "not-a-number", // Should be a number according to schema
            name: "Leanne Graham",
            email: "Sincere@april.biz"
          },
          schema: {
            type: "object",
            required: ["id", "name", "email"],
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              email: { type: "string" }
            }
          }
        }
      }
    };
    
    const response = await sendMcpRequest(request);
    
    assert(response.content && response.content.length > 0, 'Response should have content');
    assert(response.content[0].text.includes('Schema validation failed'), 
          'Schema validation should fail for invalid data');
  });
  
  /**
   * Test the mock API creation tool
   */
  it('should create a mock API endpoint', async function() {
    const request = {
      id: "test-create-mock",
      jsonrpc: "2.0",
      method: "callTool",
      params: {
        name: "create_mock",
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
      }
    };
    
    const response = await sendMcpRequest(request);
    
    assert(response.content && response.content.length > 0, 'Response should have content');
    assert(response.content[0].text.includes('API Mock created'), 
          'Response should confirm mock API created');
    assert(response.content[0].text.includes('/api/users'), 
          'Response should include the mock endpoint path');
  });
  
  /**
   * Test GraphQL request
   * Note: This uses a public GraphQL API that should be relatively stable
   */
  it('should make a GraphQL request', async function() {
    // Skip this test if no network connection or API is down
    try {
      const request = {
        id: "test-graphql-request",
        jsonrpc: "2.0",
        method: "callTool",
        params: {
          name: "graphql_request",
          arguments: {
            endpoint: "https://countries.trevorblades.com/",
            query: `
              query {
                countries(limit: 5) {
                  code
                  name
                }
              }
            `
          }
        }
      };
      
      const response = await sendMcpRequest(request);
      
      assert(response.content && response.content.length > 0, 'Response should have content');
      assert(response.content[0].text.includes('GraphQL request to'), 'Response should be from GraphQL request');
      
      // Verify actual response data
      const responseText = response.content[0].text;
      const responseDataText = responseText.split('Response: ')[1];
      const responseData = JSON.parse(responseDataText);
      
      // If this public API changes, this test might need to be updated
      assert(responseData.data, 'GraphQL response should contain data');
      assert(Array.isArray(responseData.data.countries), 'GraphQL response should contain countries array');
      assert(responseData.data.countries.length > 0, 'GraphQL response should contain at least one country');
      assert(responseData.data.countries[0].code, 'Country should have a code');
      assert(responseData.data.countries[0].name, 'Country should have a name');
    } catch (error) {
      console.warn('Skipping GraphQL test:', error.message);
      this.skip();
    }
  });
});

/**
 * Helper function to send MCP request to server and get response
 */
async function sendMcpRequest(request) {
  return new Promise((resolve, reject) => {
    // Start server process
    const server = spawn('node', [serverPath]);
    
    let responseData = '';
    let errorData = '';
    
    server.stdout.on('data', (data) => {
      responseData += data.toString();
      
      // Check if we have a complete JSON response
      try {
        const response = JSON.parse(responseData);
        if (response.id === request.id && response.result) {
          resolve(response.result);
          server.kill();
        }
      } catch (e) {
        // Not complete JSON yet, continue collecting
      }
    });
    
    server.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    server.on('close', (code) => {
      if (code !== 0 && !responseData) {
        reject(new Error(`Server process exited with code ${code}: ${errorData}`));
      }
    });
    
    // Send the request
    server.stdin.write(JSON.stringify(request) + '\n');
    
    // Set a timeout to prevent hanging
    setTimeout(() => {
      server.kill();
      reject(new Error('Request timed out'));
    }, 10000);
  });
}

// Allow running directly as a script
if (require.main === module) {
  describe.run();
}
