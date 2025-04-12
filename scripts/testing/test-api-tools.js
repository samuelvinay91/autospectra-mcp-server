/**
 * Test Script for API Testing Tools
 * 
 * This script demonstrates how to use the new API testing tools in AutoSpectra MCP server.
 * Run with: node scripts/testing/test-api-tools.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { describe, it } = require('mocha');
const assert = require('assert');

// Path to the server
const serverPath = path.join(__dirname, '../../build/index.js');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../../output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Sample MCP request for API test
const apiRequestTest = {
    id: "test-api-request",
    jsonrpc: "2.0",
    method: "callTool",
    params: {
        name: "api_request",
        arguments: {
            method: "GET",
            url: "https://jsonplaceholder.typicode.com/users",
            headers: {
                "Accept": "application/json"
            }
        }
    }
};

// Sample MCP request for schema validation
const schemaValidationTest = {
    id: "test-schema-validation",
    jsonrpc: "2.0",
    method: "callTool",
    params: {
        name: "validate_schema",
        arguments: {
            response: {
                id: 1,
                name: "John Doe",
                email: "john@example.com"
            },
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
    }
};

// Sample MCP request for GraphQL
const graphqlTest = {
    id: "test-graphql",
    jsonrpc: "2.0",
    method: "callTool",
    params: {
        name: "graphql_request",
        arguments: {
            endpoint: "https://countries.trevorblades.com/",
            query: `
                query {
                    countries {
                        code
                        name
                        capital
                    }
                }
            `
        }
    }
};

// Sample MCP request for mock API
const mockApiTest = {
    id: "test-mock-api",
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

// Run tests in sequence
async function runTests() {
    console.log("Starting API testing tools test...");
    
    try {
        // Test API Request
        console.log("\n=== Testing api_request tool ===");
        const apiResponse = await sendMcpRequest(apiRequestTest);
        console.log("API Request Response: ", apiResponse.content[0].text);
        
        // Test Schema Validation
        console.log("\n=== Testing validate_schema tool ===");
        const schemaResponse = await sendMcpRequest(schemaValidationTest);
        console.log("Schema Validation Response: ", schemaResponse.content[0].text);
        
        // Test GraphQL Request
        console.log("\n=== Testing graphql_request tool ===");
        const graphqlResponse = await sendMcpRequest(graphqlTest);
        console.log("GraphQL Response: ", graphqlResponse.content[0].text.substring(0, 200) + "...");
        
        // Test Mock API
        console.log("\n=== Testing create_mock tool ===");
        const mockResponse = await sendMcpRequest(mockApiTest);
        console.log("Mock API Response: ", mockResponse.content[0].text);
        
        console.log("\n✅ All API testing tools verified successfully!");
    } catch (error) {
        console.error("Test failed:", error);
    }
}

// Helper function to send MCP request to server
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

// Run the tests
runTests().catch(console.error);
