import express, { Request, Response } from 'express';
import { Server } from 'http';
import { config } from './utils/config';
import { logger } from './utils/logger';

/**
 * Sets up an Express HTTP server for cloud deployment
 */
export function startHttpServer(): Server | null {
  // Only start HTTP server in production or when explicitly configured
  if (process.env.NODE_ENV !== 'production' && !process.env.HTTP_SERVER) {
    return null;
  }

  const app = express();
  
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

  // Start the server
  const server = app.listen(config.port, () => {
    logger.info(`HTTP server listening on port ${config.port}`);
  });

  return server;
}
