import { request, APIRequestContext } from 'playwright';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { config } from '../utils/config';

/**
 * API testing utilities using Playwright's API request capabilities
 */
export const apiTesting = {
  /**
   * Shared API request context for reuse
   */
  _requestContext: null as APIRequestContext | null,

  /**
   * Get or create a request context
   */
  async getRequestContext(options: {
    baseURL?: string;
    extraHTTPHeaders?: Record<string, string>;
    ignoreHTTPSErrors?: boolean;
  } = {}): Promise<APIRequestContext> {
    if (this._requestContext) {
      await this._requestContext.dispose();
    }
    
    this._requestContext = await request.newContext(options);
    return this._requestContext;
  },

  /**
   * Make an HTTP request to an API endpoint
   */
  async apiRequest(args: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    data?: any;
    params?: Record<string, string>;
    auth?: {
      username?: string;
      password?: string;
      token?: string;
      type?: 'basic' | 'bearer' | 'none';
    };
    validateStatus?: boolean;
    timeout?: number;
    baseURL?: string;
    ignoreHTTPSErrors?: boolean;
  }) {
    try {
      const {
        method,
        url,
        headers = {},
        data,
        params = {},
        auth,
        validateStatus = true,
        timeout = 30000,
        baseURL,
        ignoreHTTPSErrors = false
      } = args;

      // Convert method to uppercase
      const methodUpper = method.toUpperCase();
      
      // Setup authentication if provided
      const authHeaders: Record<string, string> = {};
      if (auth) {
        if (auth.type === 'basic' && auth.username && auth.password) {
          const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          authHeaders['Authorization'] = `Basic ${credentials}`;
        } else if (auth.type === 'bearer' && auth.token) {
          authHeaders['Authorization'] = `Bearer ${auth.token}`;
        }
      }
      
      // Combine all headers
      const combinedHeaders = { ...headers, ...authHeaders };
      
      // Create or reuse request context
      const context = await this.getRequestContext({
        baseURL,
        extraHTTPHeaders: combinedHeaders,
        ignoreHTTPSErrors
      });
      
      // Build request options
      const requestOptions: any = {
        timeout
      };
      
      // Add query parameters if provided
      const urlWithParams = this._addQueryParams(url, params);
      
      // Add request body if provided
      if (data) {
        if (typeof data === 'object') {
          requestOptions.data = data;
        } else {
          requestOptions.data = data.toString();
        }
      }
      
      // Log the request
      logger.info(`Making ${methodUpper} request to ${urlWithParams}`);
      
      // Make the request using the appropriate method
      const startTime = Date.now();
      let response;
      
      switch (methodUpper) {
        case 'GET':
          response = await context.get(urlWithParams, requestOptions);
          break;
        case 'POST':
          response = await context.post(urlWithParams, requestOptions);
          break;
        case 'PUT':
          response = await context.put(urlWithParams, requestOptions);
          break;
        case 'DELETE':
          response = await context.delete(urlWithParams, requestOptions);
          break;
        case 'PATCH':
          response = await context.patch(urlWithParams, requestOptions);
          break;
        case 'HEAD':
          response = await context.head(urlWithParams, requestOptions);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${methodUpper}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Check response status if validation is enabled
      if (validateStatus && (response.status() < 200 || response.status() >= 300)) {
        throw new Error(`Request failed with status code ${response.status()}`);
      }
      
      // Get response body
      let responseBody;
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
      
      // Format response
      const responseData = {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: responseBody,
        duration
      };
      
      // Save response to output directory
      const outputDir = config.outputDir;
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const responseFile = path.join(outputDir, `api_response_${timestamp}.json`);
      fs.writeFileSync(responseFile, JSON.stringify(responseData, null, 2));
      
      logger.info(`API request completed in ${duration}ms with status ${response.status()}`);
      
      return {
        content: [
          {
            type: 'text',
            text: `API Request: ${methodUpper} ${urlWithParams}\nStatus: ${response.status()} ${response.statusText()}\nDuration: ${duration}ms\nResponse: ${JSON.stringify(responseBody, null, 2)}`
          }
        ]
      };
    } catch (error) {
      logger.error('API request error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error making API request: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Validate an API response against a schema
   */
  async validateSchema(args: {
    response: any;
    schema: any;
    schemaPath?: string;
  }) {
    try {
      const { response, schema, schemaPath } = args;
      
      // Dynamically import Ajv for JSON Schema validation
      const { default: Ajv } = await import('ajv');
      const ajv = new Ajv({ allErrors: true });
      
      let schemaObj: any;
      
      // Use provided schema or load from file
      if (schema) {
        schemaObj = typeof schema === 'string' ? JSON.parse(schema) : schema;
      } else if (schemaPath) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        schemaObj = JSON.parse(schemaContent);
      } else {
        throw new Error('Either schema or schemaPath must be provided');
      }
      
      // Parse response if it's a string
      const responseObj = typeof response === 'string' ? JSON.parse(response) : response;
      
      // Validate against schema
      const validate = ajv.compile(schemaObj);
      const valid = validate(responseObj);
      
      if (!valid) {
        const errors = validate.errors;
        return {
          content: [
            {
              type: 'text',
              text: `Schema validation failed: ${JSON.stringify(errors, null, 2)}`
            }
          ],
          isError: true
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: 'Schema validation passed successfully'
          }
        ]
      };
    } catch (error) {
      logger.error('Schema validation error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error validating schema: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Create a mock API endpoint for testing
   * Note: This is a simplified mock implementation
   */
  async createMock(args: {
    endpoint: string;
    method: string;
    response: any;
    statusCode?: number;
  }) {
    try {
      const { endpoint, method, response, statusCode = 200 } = args;
      
      // Log warning that this is a simulated mock
      logger.warn('Creating simulated API mock - this does not actually create a server');
      
      // In a real implementation, this would create a mock server
      // For now, we'll just simulate it by storing mock config
      const mockId = `${method.toUpperCase()}_${endpoint}_${Date.now()}`;
      
      // Store mock details for informational purposes
      const mockDetails = {
        id: mockId,
        endpoint,
        method: method.toUpperCase(),
        response,
        statusCode
      };
      
      const outputDir = config.outputDir;
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const safeFilename = `api_mock_${mockId.replace(/\//g, '_')}.json`;
      const mockFile = path.join(outputDir, safeFilename);
      fs.writeFileSync(mockFile, JSON.stringify(mockDetails, null, 2));
      
      return {
        content: [
          {
            type: 'text',
            text: `API Mock created (simulated):\nID: ${mockId}\nEndpoint: ${endpoint}\nMethod: ${method.toUpperCase()}\nStatus Code: ${statusCode}`
          }
        ]
      };
    } catch (error) {
      logger.error('Create mock error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error creating API mock: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Make a GraphQL request
   */
  async graphqlRequest(args: {
    endpoint: string;
    query: string;
    variables?: Record<string, any>;
    headers?: Record<string, string>;
    auth?: {
      username?: string;
      password?: string;
      token?: string;
      type?: 'basic' | 'bearer' | 'none';
    };
  }) {
    try {
      const { endpoint, query, variables = {}, headers = {}, auth } = args;
      
      // Add GraphQL-specific headers
      const graphqlHeaders = {
        'Content-Type': 'application/json',
        ...headers
      };
      
      // Prepare request payload
      const payload = {
        query,
        variables
      };
      
      // Make request using our apiRequest method
      return await this.apiRequest({
        method: 'POST',
        url: endpoint,
        headers: graphqlHeaders,
        data: payload,
        auth
      });
    } catch (error) {
      logger.error('GraphQL request error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error making GraphQL request: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  },

  /**
   * Helper to add query parameters to a URL
   */
  _addQueryParams(url: string, params: Record<string, string>): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }
    
    const urlObj = new URL(url.startsWith('http') ? url : `http://placeholder.com/${url}`);
    
    for (const [key, value] of Object.entries(params)) {
      urlObj.searchParams.append(key, value);
    }
    
    // Return just the path + query if it was a relative URL
    return url.startsWith('http') ? urlObj.toString() : `${urlObj.pathname}${urlObj.search}`;
  }
};
