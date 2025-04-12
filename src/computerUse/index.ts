import { getProvider } from './providers';
import { logger } from '../utils/logger';
import { parsePrompt } from '../nlp/promptParser';
import { automationTools } from '../automation';
import { ComputerUseProvider } from './providers/types';

// Store provider instance to reuse
let currentProvider: ComputerUseProvider | null = null;
let currentProviderType: string | null = null;

/**
 * Claude Computer Use tools
 */
export const computerUseTools = {
  /**
   * Initialize a computer use provider
   */
  async initializeProvider(args: { 
    type: 'api' | 'container';
    apiKey?: string;
    containerImage?: string;
    width?: number;
    height?: number;
  }) {
    try {
      const { type, ...options } = args;
      
      logger.info(`Initializing ${type} computer use provider`);
      
      // Clean up existing provider if type is changing
      if (currentProvider && currentProviderType !== type) {
        logger.info(`Provider type changing from ${currentProviderType} to ${type}, cleaning up existing provider`);
        await currentProvider.cleanup();
        currentProvider = null;
        currentProviderType = null;
      }
      
      // Create new provider if needed
      if (!currentProvider) {
        logger.info(`Creating new ${type} provider instance`);
        try {
          currentProvider = getProvider(type, options);
          currentProviderType = type;
          
          // Initialize the provider
          await currentProvider.initialize();
          logger.info(`Provider ${type} initialized successfully`);
        } catch (initError: any) {
          // Reset the provider state if initialization fails
          currentProvider = null;
          currentProviderType = null;
          
          // Detailed error logging
          if (initError.message?.includes('API key')) {
            logger.error(`Provider initialization failed due to API key issues: ${initError.message}`);
            return {
              content: [
                { 
                  type: 'text', 
                  text: `Error initializing ${type} computer use provider: Invalid or missing API key. Please provide a valid Anthropic API key.`
                }
              ],
              isError: true
            };
          } else {
            // Rethrow to be caught by outer try/catch
            throw initError;
          }
        }
      } else {
        logger.info(`Reusing existing ${type} provider instance`);
      }
      
      return {
        content: [
          { 
            type: 'text', 
            text: `Successfully initialized ${type} computer use provider`
          }
        ]
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      logger.error(`Provider initialization error:`, error);
      
      // Return a user-friendly error message
      return {
        content: [
          { 
            type: 'text', 
            text: `Error initializing provider: ${errorMessage}`
          }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Use computer capabilities via the initialized provider
   */
  async useComputer(args: { 
    prompt: string;
    model?: string;
  }) {
    try {
      const { prompt, model } = args;
      
      logger.info(`Using computer for task: ${prompt.substring(0, 100)}...`);
      
      // Ensure provider is initialized
      if (!currentProvider) {
        logger.info('No provider initialized, creating default API provider');
        try {
          // Attempt to initialize API provider
          currentProvider = getProvider('api');
          currentProviderType = 'api';
          await currentProvider.initialize();
        } catch (initError: any) {
          logger.error('Failed to initialize default provider:', initError);
          return {
            content: [
              { 
                type: 'text', 
                text: `Unable to execute computer task: Could not initialize provider. ${initError.message}`
              }
            ],
            isError: true
          };
        }
      }
      
      logger.info(`Executing computer task with ${currentProviderType} provider`);
      
      try {
        const result = await currentProvider.executeComputerTask(prompt, { model });
        
        if (result.error) {
          logger.error(`Provider reported error during task execution: ${result.error}`);
          return {
            content: [
              { type: 'text', text: `Error using computer: ${result.error}` }
            ],
            isError: true
          };
        }
        
        // Create response content
        const content: any[] = [
          { type: 'text', text: result.text || 'Task completed successfully (no text content returned)' }
        ];
        
        // Add images if available
        if (result.images && result.images.length > 0) {
          logger.info(`Task generated ${result.images.length} images`);
          result.images.forEach((image, index) => {
            content.push({
              type: 'image',
              data: image,
              mimeType: 'image/png'
            });
          });
        }
        
        return { content };
      } catch (taskError: any) {
        logger.error('Error during computer task execution:', taskError);
        
        // Check if the error is authentication related
        if (
          taskError.message?.includes('authentication') || 
          taskError.message?.includes('API key') ||
          taskError.message?.includes('unauthorized')
        ) {
          return {
            content: [
              { 
                type: 'text', 
                text: `Authentication error: The provided API key is invalid or lacks necessary permissions. Please check your API key and try again.`
              }
            ],
            isError: true
          };
        }
        
        // General error case
        return {
          content: [
            { type: 'text', text: `Error using computer: ${taskError.message || 'Unknown error'}` }
          ],
          isError: true
        };
      }
    } catch (error: any) {
      logger.error('Unexpected error in computer use:', error);
      return {
        content: [
          { type: 'text', text: `Error using computer: ${error.message || 'An unexpected error occurred'}` }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Use computer capabilities with fallback to AutoSpectra automation tools
   */
  async smartComputerUse(args: { 
    prompt: string;
    useAutomation?: boolean;
    model?: string;
  }) {
    const { prompt, useAutomation = true, model } = args;
    
    try {
      // First try with computer use provider
      if (currentProvider) {
        const result = await currentProvider.executeComputerTask(prompt, { model });
        
        if (!result.error) {
          return {
            content: [
              { type: 'text', text: result.text },
              ...(result.images || []).map(img => ({
                type: 'image',
                data: img,
                mimeType: 'image/png'
              }))
            ]
          };
        }
        
        // If computer use failed and automation fallback is enabled
        if (useAutomation && result.error) {
          logger.info(`Computer use failed, falling back to automation tools: ${result.error}`);
          return await this.fallbackToAutomation(prompt);
        }
        
        return {
          content: [
            { type: 'text', text: `Error using computer: ${result.error}` }
          ],
          isError: true
        };
      }
      
      // No provider initialized, try automation fallback
      if (useAutomation) {
        return await this.fallbackToAutomation(prompt);
      }
      
      // Otherwise initialize default API provider
      currentProvider = getProvider('api');
      currentProviderType = 'api';
      await currentProvider.initialize();
      
      return await this.useComputer({ prompt, model });
    } catch (error: any) {
      logger.error('Smart computer use error:', error);
      return {
        content: [
          { type: 'text', text: `Error using computer: ${error.message}` }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Fallback to using AutoSpectra automation tools
   */
  async fallbackToAutomation(prompt: string) {
    logger.info(`Using automation tools fallback for: ${prompt.substring(0, 100)}...`);
    
    try {
      // Parse prompt to determine automation needs
      const parsedIntent = await parsePrompt(prompt);
      
      // Use URL from parsed intent if available
      if (parsedIntent.url) {
        // Navigate to the URL
        return await automationTools.navigate({ url: parsedIntent.url });
      }
      
      // If we have test cases, use the steps from the first one
      if (parsedIntent.testCases && parsedIntent.testCases.length > 0) {
        const testCase = parsedIntent.testCases[0]; // Take the first test case
        
        // If there are steps, execute the first meaningful one
        if (testCase.steps && testCase.steps.length > 0) {
          for (const step of testCase.steps) {
            if (step.action === 'navigate' && step.params.url) {
              // Navigate to URL
              return await automationTools.navigate({ url: step.params.url });
            } else if (step.action === 'click' && step.params.selector) {
              // Click on element
              return await automationTools.click({ selector: step.params.selector });
            } else if (step.action === 'type' && step.params.selector) {
              // Type into element
              return await automationTools.type({ 
                selector: step.params.selector, 
                text: step.params.text || '' 
              });
            }
          }
        }
      }
      
      // If no specific action was determined, take a screenshot
      return await automationTools.screenshot();
    } catch (error: any) {
      logger.error('Automation fallback error:', error);
      return {
        content: [
          { type: 'text', text: `Error using automation fallback: ${error.message}` }
        ],
        isError: true
      };
    }
  },
  
  /**
   * Clean up provider resources
   */
  async cleanupProvider() {
    try {
      if (currentProvider) {
        await currentProvider.cleanup();
        currentProvider = null;
        currentProviderType = null;
      }
      
      return {
        content: [
          { type: 'text', text: 'Successfully cleaned up computer use provider' }
        ]
      };
    } catch (error: any) {
      logger.error('Provider cleanup error:', error);
      return {
        content: [
          { type: 'text', text: `Error cleaning up provider: ${error.message}` }
        ],
        isError: true
      };
    }
  }
};
