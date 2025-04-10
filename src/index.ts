#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { automationTools } from './automation/index';
import { testGenerationTools } from './frameworks/index';
import { parsePrompt } from './nlp/promptParser';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { visualTesting } from './automation/visualTesting';
import { testRunner } from './utils/testRunner';
import { startHttpServer } from './server';

class AutoSpectraServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'autospectra-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Error handling
    this.server.onerror = (error) => logger.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Browser automation tools
        {
          name: 'navigate',
          description: 'Navigate to a URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to navigate to'
              }
            },
            required: ['url']
          }
        },
        {
          name: 'click',
          description: 'Click on an element',
          inputSchema: {
            type: 'object',
            properties: {
              selector: {
                type: 'string',
                description: 'CSS selector of the element'
              }
            },
            required: ['selector']
          }
        },
        {
          name: 'type',
          description: 'Type text into an input field',
          inputSchema: {
            type: 'object',
            properties: {
              selector: {
                type: 'string',
                description: 'CSS selector of the input field'
              },
              text: {
                type: 'string',
                description: 'Text to type'
              },
              clearFirst: {
                type: 'boolean',
                description: 'Clear the field before typing'
              }
            },
            required: ['selector', 'text']
          }
        },
        {
          name: 'extract',
          description: 'Extract data from an element',
          inputSchema: {
            type: 'object',
            properties: {
              selector: {
                type: 'string',
                description: 'CSS selector of the element'
              },
              attribute: {
                type: 'string',
                description: 'Attribute to extract (default: textContent)'
              }
            },
            required: ['selector']
          }
        },
        {
          name: 'screenshot',
          description: 'Take a screenshot',
          inputSchema: {
            type: 'object',
            properties: {
              fullPage: {
                type: 'boolean',
                description: 'Whether to take a full page screenshot'
              }
            }
          }
        },
        {
          name: 'check_accessibility',
          description: 'Run accessibility tests on the current page',
          inputSchema: {
            type: 'object',
            properties: {
              rules: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Specific accessibility rules to check'
              },
              includeHidden: {
                type: 'boolean',
                description: 'Whether to include hidden elements in the test'
              }
            }
          }
        },
        // Test generation tools
        {
          name: 'generate_tests',
          description: 'Generate test cases for an application',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL of the application to analyze'
              },
              framework: {
                type: 'string',
                description: 'Test framework to use (e.g., playwright, mocha, jest)'
              },
              style: {
                type: 'string',
                description: 'Test style (e.g., bdd, tdd)'
              },
              format: {
                type: 'string',
                description: 'Output format (e.g., javascript, typescript)'
              },
              prompt: {
                type: 'string',
                description: 'Description of the test scenarios to generate'
              }
            },
            required: ['url', 'prompt']
          }
        },
        {
          name: 'ai_process',
          description: 'Process a task with AI to generate automation steps',
          inputSchema: {
            type: 'object',
            properties: {
              task: {
                type: 'string',
                description: 'Task description'
              },
              url: {
                type: 'string',
                description: 'URL context'
              }
            },
            required: ['task']
          }
        },
        {
          name: 'self_healing_record',
          description: 'Record a test session with self-healing selectors',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to start recording at'
              },
              outputFormat: {
                type: 'string',
                description: 'Output format (e.g., playwright, cypress)'
              }
            },
            required: ['url']
          }
        },
        {
          name: 'visual_comparison',
          description: 'Compare visual snapshots of a web page',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to compare'
              },
              baselinePath: {
                type: 'string',
                description: 'Path to baseline image (if any)'
              },
              threshold: {
                type: 'number',
                description: 'Comparison threshold (0-1)'
              }
            },
            required: ['url']
          }
        },
        {
          name: 'list_frameworks',
          description: 'Get a list of supported test frameworks, styles, and formats',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'run_test',
          description: 'Run a generated test file',
          inputSchema: {
            type: 'object',
            properties: {
              testPath: {
                type: 'string',
                description: 'Path to the test file to run'
              },
              installDeps: {
                type: 'boolean',
                description: 'Whether to install dependencies if needed'
              }
            },
            required: ['testPath']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        
        // Handle automation tools
        if (name === 'navigate') {
          return await automationTools.navigate(args as { url: string });
        } 
        else if (name === 'click') {
          return await automationTools.click(args as { selector: string });
        }
        else if (name === 'type') {
          return await automationTools.type(args as { selector: string; text: string; clearFirst?: boolean });
        }
        else if (name === 'extract') {
          return await automationTools.extract(args as { selector: string; attribute?: string });
        }
        else if (name === 'screenshot') {
          return await automationTools.screenshot(args as { fullPage?: boolean });
        }
        else if (name === 'check_accessibility') {
          return await automationTools.checkAccessibility(args as { 
            rules?: string[], 
            includeHidden?: boolean 
          });
        }
        
        // Handle test generation tools
        if (name === 'generate_tests') {
          return await testGenerationTools.generateTests(args as {
            url: string;
            framework?: string;
            style?: string;
            format?: string;
            prompt: string;
          });
        }
        
        if (name === 'ai_process') {
          const { task, url } = args as { task: string; url?: string };
          const parsedIntent = await parsePrompt(task, url);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(parsedIntent, null, 2)
              }
            ]
          };
        }
        
        // Handle visual testing tools
        if (name === 'visual_comparison') {
          return await visualTesting.compareScreenshots(args as { 
            url: string; 
            baselinePath?: string;
            threshold?: number;
          });
        }
        
        if (name === 'accessibility_test') {
          return await visualTesting.accessibilityTest(args as {
            url: string;
            standard?: string;
          });
        }
        
        if (name === 'run_test') {
          const { testPath, installDeps = true } = args as { 
            testPath: string;
            installDeps?: boolean;
          };
          
          const result = await testRunner.runTest(testPath);
          
          let content = `Test execution ${result.success ? 'succeeded' : 'failed'}\n\n` +
                        `Output:\n${result.output}\n\n`;
          
          if (result.screenshots.length > 0) {
            content += `Screenshots captured:\n`;
            result.screenshots.forEach(screenshot => {
              content += `- ${screenshot}\n`;
            });
          }
          
          return {
            content: [{ 
              type: 'text', 
              text: content 
            }]
          };
        }
        
        if (name === 'list_frameworks') {
          return await testGenerationTools.listFrameworks();
        }

        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        logger.error('Error handling tool request:', error);
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : String(error)
        );
      }
    });
  }

  async run() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      logger.info('AutoSpectra MCP server running on stdio');
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start both HTTP server (for cloud deployment) and MCP server
const httpServer = startHttpServer();
if (httpServer) {
  logger.info('HTTP server started for cloud deployment');
}

const server = new AutoSpectraServer();
server.run().catch(console.error);
