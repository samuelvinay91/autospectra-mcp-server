import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
// If NODE_ENV is production, try to load .env.production first
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'production') {
  // Try to load production env file first, then fall back to default .env
  const envProductionPath = path.resolve(process.cwd(), '.env.production');
  if (fs.existsSync(envProductionPath)) {
    dotenv.config({ path: envProductionPath });
    console.log('Loaded production environment variables');
  } else {
    dotenv.config();
    console.log('Production environment file not found, using default .env');
  }
} else {
  dotenv.config();
  console.log(`Using ${nodeEnv} environment variables`);
}

// Use CommonJS __dirname since we switched to CommonJS module
const rootDir = path.resolve(__dirname, '../..');

interface Config {
  // Server configuration
  port: number;
  debug: boolean;
  
  // Playwright configuration
  headless: boolean;
  slowMo: number;
  
  // Test generation
  outputDir: string;
  templateDir: string;
  
  // Supported frameworks
  supportedFrameworks: string[];
  supportedStyles: string[];
  supportedFormats: string[];
}

const defaultConfig: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  debug: process.env.DEBUG === 'true',
  
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),
  
  outputDir: process.env.OUTPUT_DIR || path.join(rootDir, 'output'),
  templateDir: process.env.TEMPLATE_DIR || path.join(rootDir, 'src', 'templates'),
  
  supportedFrameworks: ['playwright', 'mocha', 'jest'],
  supportedStyles: ['bdd', 'tdd'],
  supportedFormats: ['javascript', 'typescript'],
};

// Ensure output directory exists
if (!fs.existsSync(defaultConfig.outputDir)) {
  fs.mkdirSync(defaultConfig.outputDir, { recursive: true });
}

export const config: Config = defaultConfig;
