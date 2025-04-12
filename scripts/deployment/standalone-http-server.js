/**
 * Standalone HTTP server for testing Computer Use API
 * 
 * Usage:
 * node standalone-http-server.js
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001; // Use a different port than the main server

// Enable JSON parsing and CORS
app.use(express.json());
app.use(cors());

// Health check endpoint 
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Standalone Computer Use API Server',
    description: 'Testing server for computer use capabilities',
    status: 'running'
  });
});

// Mock Computer Use endpoints
app.post('/api/tools/initialize_computer', (req, res) => {
  console.log('Initialize computer request:', req.body);
  res.status(200).json({
    content: [{ 
      type: 'text', 
      text: 'Successfully initialized computer use provider' 
    }]
  });
});

app.post('/api/tools/use_computer', (req, res) => {
  console.log('Use computer request:', req.body);
  res.status(200).json({
    content: [{ 
      type: 'text', 
      text: `Executed computer task: "${req.body.prompt}"` 
    }]
  });
});

app.post('/api/tools/smart_computer_use', (req, res) => {
  console.log('Smart computer use request:', req.body);
  res.status(200).json({
    content: [{ 
      type: 'text', 
      text: `Executed smart computer task: "${req.body.prompt}"` 
    }]
  });
});

app.post('/api/tools/cleanup_computer', (req, res) => {
  console.log('Cleanup computer request:', req.body);
  res.status(200).json({
    content: [{ 
      type: 'text', 
      text: 'Successfully cleaned up computer use provider' 
    }]
  });
});

// API testing endpoints
app.post('/api/tools/api_request', (req, res) => {
  console.log('API request:', req.body);
  res.status(200).json({
    content: [{ 
      type: 'text', 
      text: `Executed API request: ${req.body.method} ${req.body.url}` 
    }]
  });
});

app.post('/api/tools/validate_schema', (req, res) => {
  console.log('Schema validation request:', req.body);
  res.status(200).json({
    content: [{ 
      type: 'text', 
      text: 'Schema validation passed successfully' 
    }]
  });
});

app.post('/api/tools/create_mock', (req, res) => {
  console.log('Create mock request:', req.body);
  res.status(200).json({
    content: [{ 
      type: 'text', 
      text: `API Mock created (simulated):\nEndpoint: ${req.body.endpoint}\nMethod: ${req.body.method.toUpperCase()}\nStatus Code: ${req.body.statusCode || 200}` 
    }]
  });
});

app.post('/api/tools/graphql_request', (req, res) => {
  console.log('GraphQL request:', req.body);
  res.status(200).json({
    content: [{ 
      type: 'text', 
      text: `Executed GraphQL request to ${req.body.endpoint}` 
    }]
  });
});

// Available tools endpoint
app.get('/api/tools', (req, res) => {
  res.status(200).json({
    tools: [
      // Browser automation tools
      'navigate', 
      'click', 
      'type', 
      'extract', 
      'screenshot', 
      'check_accessibility',
      
      // API testing tools
      'api_request',
      'validate_schema',
      'create_mock',
      'graphql_request',
      
      // Computer use tools
      'initialize_computer',
      'use_computer',
      'smart_computer_use',
      'cleanup_computer'
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Standalone server running on http://localhost:${PORT}`);
  console.log('Try these endpoints:');
  console.log(`- GET  http://localhost:${PORT}/health`);
  console.log(`- GET  http://localhost:${PORT}/api/tools`);
  
  // Browser automation tools
  console.log(`- POST http://localhost:${PORT}/api/tools/navigate`);
  console.log(`- POST http://localhost:${PORT}/api/tools/click`);
  
  // API testing tools
  console.log(`- POST http://localhost:${PORT}/api/tools/api_request`);
  console.log(`- POST http://localhost:${PORT}/api/tools/validate_schema`);
  console.log(`- POST http://localhost:${PORT}/api/tools/create_mock`);
  console.log(`- POST http://localhost:${PORT}/api/tools/graphql_request`);
  
  // Computer use tools
  console.log(`- POST http://localhost:${PORT}/api/tools/initialize_computer`);
  console.log(`- POST http://localhost:${PORT}/api/tools/use_computer`);
});
