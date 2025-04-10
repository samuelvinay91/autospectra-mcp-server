import { chromium, firefox, webkit, Browser, Page, BrowserContext } from 'playwright';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

/**
 * Manages browser instances and provides utility methods for browser automation
 */
class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium';

  /**
   * Initialize a browser instance if not already initialized
   */
  async getBrowser(type: 'chromium' | 'firefox' | 'webkit' = 'chromium'): Promise<Browser> {
    if (!this.browser || this.browserType !== type) {
      await this.closeBrowser();
      
      this.browserType = type;
      
      logger.info(`Launching ${type} browser`);
      switch (type) {
        case 'firefox':
          this.browser = await firefox.launch({ 
            headless: config.headless, // Use the configuration setting
            slowMo: config.slowMo, // Use the configuration setting
            args: config.headless ? [] : ['--start-maximized', '--window-position=50,50'] // Only use window positioning in non-headless mode
          });
          break;
        case 'webkit':
          this.browser = await webkit.launch({ 
            headless: config.headless, // Use the configuration setting
            slowMo: config.slowMo, // Use the configuration setting
            args: config.headless ? [] : ['--start-maximized', '--window-position=50,50'] // Only use window positioning in non-headless mode
          });
          break;
        default:
          this.browser = await chromium.launch({ 
            headless: config.headless, // Use the configuration setting
            slowMo: config.slowMo, // Use the configuration setting
            args: config.headless ? [] : ['--start-maximized', '--window-position=50,50'] // Only use window positioning in non-headless mode
          });
      }
    }
    
    return this.browser;
  }

  /**
   * Get or create a browser context
   */
  async getContext(): Promise<BrowserContext> {
    if (!this.context) {
      const browser = await this.getBrowser();
      // Create a context with more visible settings
      this.context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'AutoSpectra/1.0 Playwright',
        colorScheme: 'light', // Ensure light mode for better visibility
        deviceScaleFactor: 1 // Normal scaling
      });
    }
    
    return this.context;
  }

  /**
   * Get or create a page
   */
  async getPage(): Promise<Page> {
    if (!this.page) {
      const context = await this.getContext();
      this.page = await context.newPage();
      
      // Set up page event listeners for debugging
      if (config.debug) {
        this.page.on('console', msg => logger.debug(`Console ${msg.type()}: ${msg.text()}`));
        this.page.on('pageerror', err => logger.error('Page error:', err));
      }
    }
    
    return this.page;
  }

  /**
   * Close the current browser instance and all associated resources
   */
  async closeBrowser(): Promise<void> {
    if (this.page) {
      await this.page.close().catch(e => logger.error('Error closing page:', e));
      this.page = null;
    }
    
    if (this.context) {
      await this.context.close().catch(e => logger.error('Error closing context:', e));
      this.context = null;
    }
    
    if (this.browser) {
      await this.browser.close().catch(e => logger.error('Error closing browser:', e));
      this.browser = null;
    }
  }

  /**
   * Find an element with self-healing selector strategies
   */
  async findElement(page: Page, selector: string): Promise<any> {
    try {
      // Try the original selector first
      const element = await page.$(selector);
      if (element) return element;
      
      // If the original selector fails, try alternative strategies
      
      // 1. Try data-testid if the selector looks like an ID
      if (selector.startsWith('#')) {
        const testIdSelector = `[data-testid="${selector.substring(1)}"]`;
        const element = await page.$(testIdSelector);
        if (element) {
          logger.info(`Self-healed selector: ${selector} -> ${testIdSelector}`);
          return element;
        }
      }
      
      // 2. Try text content if other methods fail
      // Extract potential text content from selector (e.g., for 'button:has-text("Submit")')
      const textMatch = selector.match(/:has-text\("([^"]+)"\)/);
      if (textMatch && textMatch[1]) {
        const text = textMatch[1];
        const textSelector = `text="${text}"`;
        const element = await page.$(textSelector);
        if (element) {
          logger.info(`Self-healed selector: ${selector} -> ${textSelector}`);
          return element;
        }
      }
      
      // If all strategies fail, return null
      return null;
    } catch (error) {
      logger.error('Error finding element:', error);
      return null;
    }
  }
}

export const browserManager = new BrowserManager();
