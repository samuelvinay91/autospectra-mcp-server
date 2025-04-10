import { logger } from '../utils/logger';
import { config } from '../utils/config';
import { ParsedIntent, TestCase, parsePrompt } from '../nlp/promptParser';
import { generatePlaywrightTest } from './playwright';
import { generateMochaTest } from './mocha';
import fs from 'fs';
import path from 'path';

/**
 * Test generation tools
 */
export const testGenerationTools = {
  /**
   * Generate test cases for an application based on parsed intent
   */
  async generateTests(args: { 
    url: string; 
    framework?: string; 
    style?: string; 
    format?: string;
    prompt: string;
  }) {
    try {
      const { url, prompt, framework = 'playwright', style = 'bdd', format = 'javascript' } = args;
      
      logger.info(`Generating tests for ${url} using ${framework} (${style} style, ${format} format)`);
      
      // Validate inputs
      if (!config.supportedFrameworks.includes(framework)) {
        return {
          content: [{ 
            type: 'text', 
            text: `Unsupported framework: ${framework}. Supported frameworks are: ${config.supportedFrameworks.join(', ')}` 
          }],
          isError: true
        };
      }
      
      if (!config.supportedStyles.includes(style)) {
        return {
          content: [{ 
            type: 'text', 
            text: `Unsupported style: ${style}. Supported styles are: ${config.supportedStyles.join(', ')}` 
          }],
          isError: true
        };
      }
      
      if (!config.supportedFormats.includes(format)) {
        return {
          content: [{ 
            type: 'text', 
            text: `Unsupported format: ${format}. Supported formats are: ${config.supportedFormats.join(', ')}` 
          }],
          isError: true
        };
      }
      
      // Use the imported parsePrompt function
      // No need for dynamic import since we're importing at the top
      
      // Parse the prompt to extract test scenarios
      const parsedIntent = await parsePrompt(prompt, url);
      
      // Generate tests based on framework
      let generatedCode = '';
      let frameworkName = '';
      
      if (framework === 'playwright') {
        generatedCode = await generatePlaywrightTest(parsedIntent, { style, format });
        frameworkName = 'Playwright';
      } else if (framework === 'mocha') {
        generatedCode = await generateMochaTest(parsedIntent, { style, format });
        frameworkName = 'Mocha';
      } else {
        // Default to Playwright if framework not specifically implemented
        generatedCode = await generatePlaywrightTest(parsedIntent, { style, format });
        frameworkName = 'Playwright';
      }
      
      // Save the generated test code to a file
      const fileExtension = format === 'typescript' ? 'ts' : 'js';
      const fileName = `${framework}-test.${fileExtension}`;
      const filePath = path.join(config.outputDir, fileName);
      
      fs.writeFileSync(filePath, generatedCode);
      
        return {
          content: [
            { 
              type: 'text', 
              text: `Successfully generated ${frameworkName} tests for ${url}\n\nGenerated test code:\n\n\`\`\`${format}\n${generatedCode}\n\`\`\`\n\nTests saved to: ${filePath}` 
            }
          ]
        };
    } catch (error) {
      logger.error('Error generating tests:', error);
      return {
        content: [{ 
          type: 'text', 
          text: `Error generating tests: ${error instanceof Error ? error.message : String(error)}` 
        }],
        isError: true
      };
    }
  },
  
  /**
   * List supported test frameworks, styles, and formats
   */
  async listFrameworks() {
    return {
      content: [{ 
        type: 'text', 
        text: `Supported frameworks: ${config.supportedFrameworks.join(', ')}\nSupported styles: ${config.supportedStyles.join(', ')}\nSupported formats: ${config.supportedFormats.join(', ')}` 
      }]
    };
  }
};
