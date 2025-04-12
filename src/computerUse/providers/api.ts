import { Anthropic } from '@anthropic-ai/sdk';
import { ComputerUseProvider, ComputerUseResult } from './types';
import { logger } from '../../utils/logger';

/**
 * Error types specific to the Anthropic API
 */
enum AnthropicErrorType {
  AUTHENTICATION = 'authentication_error',
  PERMISSION = 'permission_error',
  RATE_LIMIT = 'rate_limit_error',
  INVALID_REQUEST = 'invalid_request_error',
  NOT_FOUND = 'not_found_error',
  SERVER = 'server_error',
  SERVICE_UNAVAILABLE = 'service_unavailable_error',
  API_ERROR = 'api_error',
  UNKNOWN = 'unknown_error'
}

// Tool versions
enum ToolVersion {
  CLAUDE_35_SONNET = '20241022',
  CLAUDE_37_SONNET = '20250124'
}

/**
 * API-based provider for Claude's computer use capabilities
 */
export class AnthropicApiProvider implements ComputerUseProvider {
  name = 'anthropic-api';
  private client: Anthropic | null = null;
  private apiKey: string;
  private isInitialized = false;
  private preferredModel = 'claude-3-5-sonnet-20240620';
  private toolVersion = ToolVersion.CLAUDE_35_SONNET; // Default to Claude 3.5 Sonnet tools
  
  constructor(apiKey?: string, options: any = {}) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    
    // Set preferred model if provided
    if (options.model) {
      this.preferredModel = options.model;
      
      // If using Claude 3.7 Sonnet, use the newer tool version
      if (options.model.includes('claude-3-7')) {
        this.toolVersion = ToolVersion.CLAUDE_37_SONNET;
      }
    }
    
    if (!this.apiKey) {
      logger.error('No API key provided to AnthropicApiProvider');
      throw new Error('ANTHROPIC_API_KEY environment variable or apiKey option is required');
    }
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.debug('Anthropic API provider already initialized');
      return;
    }
    
    try {
      logger.info('Initializing Anthropic API provider');
      
      // Create the client during initialization to ensure apiKey is available
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });
      
      // Validate API key
      if (!this.client.apiKey) {
        logger.error('Invalid Anthropic API key - empty after initialization');
        throw new Error('ANTHROPIC_API_KEY appears to be invalid or empty');
      }
      
      // Test API key with a minimal API call
      await this.verifyApiAccess();
      
      this.isInitialized = true;
      logger.info('Successfully initialized Anthropic API provider with valid API key');
    } catch (error: any) {
      this.isInitialized = false;
      this.client = null;
      
      // Handle and categorize initialization errors
      this.handleApiError(error, 'Initialization error');
      
      // Always rethrow the error after logging, so the caller can handle it appropriately
      throw error;
    }
  }
  
  /**
   * Verifies that the API key has proper access to computer use capabilities
   */
  private async verifyApiAccess(): Promise<void> {
    if (!this.client) {
      logger.error('Cannot verify API access - client is not initialized');
      throw new Error('Anthropic client not initialized');
    }
    
    try {
      logger.debug('Verifying API key with test request');
      
      // Make a minimal request to test the API key and permissions
      // Use a model that's widely available across API keys
      await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'API key verification test' }]
      });
      
      logger.info('API key verification successful');
    } catch (error: any) {
      logger.error('API key verification failed', error);
      
      // Extract API error details for better diagnosis
      const errorType = this.getAnthropicErrorType(error);
      
      switch (errorType) {
        case AnthropicErrorType.AUTHENTICATION:
          throw new Error('API key authentication failed - invalid key');
        case AnthropicErrorType.PERMISSION:
          throw new Error('API key lacks necessary permissions');
        default:
          // Rethrow the original error with additional context
          throw new Error(`API key verification failed: ${error.message}`);
      }
    }
  }
  
  async executeComputerTask(prompt: string, options: any = {}): Promise<ComputerUseResult> {
    try {
      // Ensure provider is initialized
      if (!this.isInitialized || !this.client) {
        logger.info('Provider not initialized, initializing now');
        await this.initialize();
      }
      
      // Double-check after initialization
      if (!this.client) {
        logger.error('Client still null after initialization attempt');
        throw new Error('Failed to initialize Anthropic client');
      }
      
      // Determine which model to use (with fallback)
      const model = options.model || this.preferredModel;
      
      // Determine tool version based on model
      const toolVersion = model.includes('claude-3-7') ? 
        ToolVersion.CLAUDE_37_SONNET : 
        ToolVersion.CLAUDE_35_SONNET;
      
      // Set up the appropriate beta flag based on tool version
      const betaFlag = toolVersion === ToolVersion.CLAUDE_37_SONNET ?
        'computer-use-2025-01-24' :
        'computer-use-2024-10-22';
      
      logger.info(`Executing computer task with model ${model} and tool version ${toolVersion}`);
      logger.info(`Using beta flag: ${betaFlag}`);
      
  // Define Anthropic-defined tools
  // For Claude models, all tools must use the same version
  const tools = [
    {
      type: `computer_${toolVersion}`,
      name: 'computer',
      display_width_px: 1024,
      display_height_px: 768,
      display_number: 1
    },
    {
      type: `text_editor_${toolVersion}`, 
      name: 'str_replace_editor'
    },
    {
      type: `bash_${toolVersion}`,
      name: 'bash'
    }
  ];
      
      // Set up thinking parameter for Claude 3.7 Sonnet
      const thinking = toolVersion === ToolVersion.CLAUDE_37_SONNET ?
        { type: "enabled" as const, budget_tokens: 1024 } :
        undefined;
      
      const requestStart = Date.now();
      
      // Use messages.create with appropriate parameters for the SDK version
      const response = await this.client.beta.messages.create({
        model,
        // Ensure max_tokens is greater than thinking.budget_tokens (1024)
        max_tokens: options.maxTokens || (toolVersion === ToolVersion.CLAUDE_37_SONNET ? 2048 : 4096),
        messages: [{ role: 'user', content: prompt }],
        tools,
        betas: [betaFlag],
        thinking
      } as any); // Type assertion due to SDK type limitations
      
      const requestDuration = Date.now() - requestStart;
      logger.info(`Computer task completed in ${requestDuration}ms`);
      
      // Extract text content from the response
      const textContent = response.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n');
      
      // Extract tool use information
      const toolUse = response.content
        .filter((c: any) => c.type === 'tool_use');
      
      // Extract thinking content if available (using type assertion as it's not in the type definitions)
      const thinkingContent = (response as any).thinking ? 
        (response as any).thinking.content
          .map((t: any) => t.text)
          .join('\n') : 
        '';
      
      // Extract any images if present
      const images = response.content
        .filter((c: any) => c.type === 'image')
        .map((c: any) => c.source?.data)
        .filter(Boolean);
      
      return {
        text: textContent,
        toolUse: toolUse.length > 0 ? toolUse : undefined,
        images: images,
        thinking: thinkingContent || undefined
      };
    } catch (error: any) {
      // Handle various API errors
      this.handleApiError(error, 'Computer task execution error');
      
      // After logging, rethrow the error
      throw error;
    }
  }
  
  /**
   * Handle and log API errors with detailed information
   */
  private handleApiError(error: any, context: string): void {
    const errorType = this.getAnthropicErrorType(error);
    const status = error.status || 'unknown';
    
    switch (errorType) {
      case AnthropicErrorType.AUTHENTICATION:
        logger.error(`${context}: Authentication error (status: ${status})`, error);
        break;
      case AnthropicErrorType.PERMISSION:
        logger.error(`${context}: Permission denied (status: ${status})`, error);
        break;
      case AnthropicErrorType.RATE_LIMIT:
        logger.error(`${context}: Rate limit exceeded (status: ${status})`, error);
        break;
      case AnthropicErrorType.INVALID_REQUEST:
        logger.error(`${context}: Invalid request (status: ${status})`, error);
        break;
      case AnthropicErrorType.SERVER:
      case AnthropicErrorType.SERVICE_UNAVAILABLE:
        logger.error(`${context}: Service unavailable (status: ${status})`, error);
        break;
      default:
        logger.error(`${context}: Unknown error type (status: ${status})`, error);
    }
    
    // Log additional details if available
    if (error.response?.data) {
      logger.error('API error details:', error.response.data);
    }
  }
  
  /**
   * Determine the type of Anthropic API error
   */
  private getAnthropicErrorType(error: any): AnthropicErrorType {
    // Check if it's a standard Anthropic error
    if (error.type) {
      return error.type as AnthropicErrorType;
    }
    
    // Check error message for authentication issues
    if (
      error.status === 401 || 
      error.message?.includes('authentication') || 
      error.message?.includes('invalid') && error.message?.includes('key') || 
      error.message?.includes('unauthorized')
    ) {
      return AnthropicErrorType.AUTHENTICATION;
    }
    
    // Check for permission issues
    if (
      error.status === 403 || 
      error.message?.includes('permission') || 
      error.message?.includes('access') && error.message?.includes('denied')
    ) {
      return AnthropicErrorType.PERMISSION;
    }
    
    // Check for rate limit issues
    if (
      error.status === 429 || 
      error.message?.includes('rate limit') || 
      error.message?.includes('too many requests')
    ) {
      return AnthropicErrorType.RATE_LIMIT;
    }
    
    // Server errors
    if (error.status >= 500) {
      return AnthropicErrorType.SERVER;
    }
    
    // Default to unknown error
    return AnthropicErrorType.UNKNOWN;
  }
  
  async cleanup(): Promise<void> {
    logger.info('Cleaning up Anthropic API provider');
    // Reset the client and initialization state
    this.client = null;
    this.isInitialized = false;
  }
}
