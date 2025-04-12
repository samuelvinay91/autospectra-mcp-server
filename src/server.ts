import express, { Request, Response } from 'express';
import { Server } from 'http';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { automationTools } from './automation';
import { testGenerationTools } from './frameworks';
import { computerUseTools } from './computerUse';
import cors from 'cors';

/**
 * Sets up an Express HTTP server for cloud deployment
 */
export function startHttpServer(): Server | null {
  // Always start HTTP server if HTTP_SERVER is true, otherwise only in production
  if (process.env.NODE_ENV !== 'production' && process.env.HTTP_SERVER !== 'true') {
    console.log(`HTTP_SERVER is ${process.env.HTTP_SERVER}`);
    return null;
  }

  const app = express();
  
  // Enable JSON parsing and CORS
  app.use(express.json());
  app.use(cors());
  
  // Health check endpoint for cloud providers
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Root endpoint for basic info
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'AutoSpectra MCP Server',
      description: 'Browser automation and testing with MCP protocol',
      status: 'running'
    });
  });
  
  // API endpoint for available tools
  app.get('/api/tools', (req: Request, res: Response) => {
    res.status(200).json({
      tools: [
        // Browser automation tools
        'navigate', 'click', 'type', 'extract', 'screenshot', 'check_accessibility',
        // Test generation tools
        'generate_tests', 'ai_process', 'list_frameworks', 'run_test',
        // Visual testing tools
        'visual_comparison',
        // Computer use tools
        'initialize_computer', 'use_computer', 'smart_computer_use', 'cleanup_computer'
      ]
    });
  });
  
  // Tool endpoints
  
  // Computer use tools
  app.post('/api/tools/initialize_computer', async (req: Request, res: Response) => {
    try {
      const result = await computerUseTools.initializeProvider(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error initializing computer provider:', error);
      res.status(500).json({
        content: [{ type: 'text', text: `Error: ${error.message || 'Unknown error'}` }],
        isError: true
      });
    }
  });
  
  app.post('/api/tools/use_computer', async (req: Request, res: Response) => {
    try {
      const result = await computerUseTools.useComputer(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error using computer:', error);
      res.status(500).json({
        content: [{ type: 'text', text: `Error: ${error.message || 'Unknown error'}` }],
        isError: true
      });
    }
  });
  
  app.post('/api/tools/smart_computer_use', async (req: Request, res: Response) => {
    try {
      const result = await computerUseTools.smartComputerUse(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error using smart computer:', error);
      res.status(500).json({
        content: [{ type: 'text', text: `Error: ${error.message || 'Unknown error'}` }],
        isError: true
      });
    }
  });
  
  app.post('/api/tools/cleanup_computer', async (req: Request, res: Response) => {
    try {
      const result = await computerUseTools.cleanupProvider();
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error cleaning up computer provider:', error);
      res.status(500).json({
        content: [{ type: 'text', text: `Error: ${error.message || 'Unknown error'}` }],
        isError: true
      });
    }
  });

  // Start the server
  const server = app.listen(config.port, () => {
    logger.info(`HTTP server listening on port ${config.port}`);
  });

  return server;
}
