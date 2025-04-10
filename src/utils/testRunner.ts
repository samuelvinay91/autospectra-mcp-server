import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { config } from './config';

/**
 * Utilities for running generated tests and managing dependencies
 */
export const testRunner = {
  /**
   * Ensure Playwright is installed and configured
   */
  async ensurePlaywrightInstalled(): Promise<boolean> {
    try {
      logger.info('Checking Playwright installation...');
      
      try {
        // Check if playwright is installed
        execSync('npx playwright --version', { stdio: 'ignore' });
        logger.info('Playwright is already installed');
        return true;
      } catch (error) {
        // Playwright is not installed, install it
        logger.info('Playwright not found, installing...');
        
        // Create the output directory if it doesn't exist
        if (!fs.existsSync(config.outputDir)) {
          fs.mkdirSync(config.outputDir, { recursive: true });
        }
        
        // Create a temporary package.json if needed
        const packageJsonPath = path.join(config.outputDir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
          fs.writeFileSync(packageJsonPath, JSON.stringify({
            name: "autospectra-test-runner",
            version: "1.0.0",
            private: true
          }, null, 2));
        }
        
        // Install playwright in the output directory
        const installProcess = spawn('npm', ['install', '@playwright/test', 'playwright'], {
          cwd: config.outputDir,
          stdio: 'pipe'
        });
        
        return new Promise((resolve) => {
          installProcess.stdout.on('data', (data) => {
            logger.info(`Playwright install: ${data}`);
          });
          
          installProcess.stderr.on('data', (data) => {
            logger.error(`Playwright install error: ${data}`);
          });
          
          installProcess.on('close', (code) => {
            if (code === 0) {
              logger.info('Playwright installed successfully');
              
              // Install browser dependencies
              logger.info('Installing browser dependencies...');
              try {
                execSync('npx playwright install chromium', { cwd: config.outputDir });
                logger.info('Browser dependencies installed successfully');
                resolve(true);
              } catch (error) {
                logger.error('Failed to install browser dependencies:', error);
                resolve(false);
              }
            } else {
              logger.error(`Playwright installation failed with code ${code}`);
              resolve(false);
            }
          });
        });
      }
    } catch (error) {
      logger.error('Error ensuring Playwright is installed:', error);
      return false;
    }
  },
  
  /**
   * Run a generated test file
   */
  async runTest(testFilePath: string): Promise<{
    success: boolean;
    output: string;
    screenshots: string[];
  }> {
    try {
      logger.info(`Running test file: ${testFilePath}`);
      
      // Ensure the test file exists
      if (!fs.existsSync(testFilePath)) {
        throw new Error(`Test file not found: ${testFilePath}`);
      }
      
      // Make sure Playwright is installed
      const isInstalled = await this.ensurePlaywrightInstalled();
      if (!isInstalled) {
        throw new Error('Playwright is not installed, cannot run tests');
      }
      
      // Create a temporary playwright.config.js if it doesn't exist
      const configDir = path.dirname(testFilePath);
      const configPath = path.join(configDir, 'playwright.config.js');
      
      if (!fs.existsSync(configPath)) {
        const configContent = `
          module.exports = {
            testDir: './',
            timeout: 30000,
            reporter: 'list',
            use: {
              headless: false,
              viewport: { width: 1280, height: 720 },
              screenshot: 'on',
              trace: 'on',
            },
          };
        `;
        fs.writeFileSync(configPath, configContent);
      }
      
      // Run the test
      const outputDir = path.join(configDir, 'test-results');
      return new Promise((resolve) => {
        let output = '';
        
        // Use the 'node_modules/.bin/playwright' executable directly if it exists
        // This avoids using 'npx' which might not be available in PATH
        let playwrightBin = path.join(process.cwd(), 'node_modules', '.bin', 'playwright');
        if (process.platform === 'win32') {
          playwrightBin += '.cmd'; // Use the .cmd file on Windows
        }
        
        // Check if the playwright executable exists
        const playwrightExists = fs.existsSync(playwrightBin);
        
        let testProcess;
        if (playwrightExists) {
          // Use the local playwright binary directly
          logger.info(`Using local Playwright binary: ${playwrightBin}`);
          testProcess = spawn(playwrightBin, [
            'test', 
            testFilePath,
            '--output', outputDir
          ], {
            cwd: configDir,
            shell: true
          });
        } else {
          // Fall back to using npx with shell enabled
          logger.info('Falling back to npx playwright');
          testProcess = spawn('npx', [
            'playwright', 'test', 
            testFilePath,
            '--output', outputDir
          ], {
            cwd: configDir,
            shell: true
          });
        }
        
        testProcess.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          logger.info(`Test output: ${text}`);
        });
        
        testProcess.stderr.on('data', (data) => {
          const text = data.toString();
          output += text;
          logger.error(`Test error: ${text}`);
        });
        
        testProcess.on('close', (code) => {
          const success = code === 0;
          logger.info(`Test run ${success ? 'succeeded' : 'failed'} with code ${code}`);
          
          // Find screenshots
          const screenshots: string[] = [];
          if (fs.existsSync(outputDir)) {
            try {
              const findScreenshots = (dir: string) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                  const fullPath = path.join(dir, file);
                  if (fs.statSync(fullPath).isDirectory()) {
                    findScreenshots(fullPath);
                  } else if (file.endsWith('.png')) {
                    screenshots.push(fullPath);
                  }
                }
              };
              
              findScreenshots(outputDir);
            } catch (error) {
              logger.error('Error finding screenshots:', error);
            }
          }
          
          resolve({
            success,
            output,
            screenshots
          });
        });
      });
    } catch (error) {
      logger.error('Error running test:', error);
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error),
        screenshots: []
      };
    }
  }
};
