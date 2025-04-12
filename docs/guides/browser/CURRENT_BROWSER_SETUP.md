# Current Browser Configuration in AutoSpectra MCP

This document explains how the browser automation is currently configured in the AutoSpectra MCP server and how to verify/modify the browser visibility settings.

## Current Configuration

The browser visibility is already configured in these key places:

1. **Environment Variables** (in `.env`):
   ```
   # Playwright configuration
   HEADLESS=false
   SLOW_MO=50
   ```

2. **Configuration Module** (in `src/utils/config.ts`):
   ```typescript
   headless: process.env.HEADLESS !== 'false',
   slowMo: parseInt(process.env.SLOW_MO || '0', 10),
   ```

3. **Browser Manager** (in `src/automation/browserManager.ts`):
   ```typescript
   this.browser = await chromium.launch({ 
     headless: config.headless, 
     slowMo: config.slowMo, 
     args: config.headless ? [] : ['--start-maximized', '--window-position=50,50']
   });
   ```

## Why Browsers Are Sometimes Still Headless

Despite the `HEADLESS=false` setting, browsers launched through MCP tools may still appear to run in headless mode because:

1. **Tool Implementation**: Some MCP tools might override the default configuration with their own settings
2. **API vs Direct**: Tools accessed via the API interface might apply different settings than direct script execution
3. **Feature Flags**: There might be feature flags or conditional logic that affects browser visibility

## How to Verify Browser Visibility

You can verify browser visibility with different methods:

1. **Direct Script**: Run `node launch-visible-browser.js` or `node test-visible-browser.js`
2. **Check Browser Process**: Look for Chrome/Chromium processes in Task Manager or Activity Monitor
3. **Modify Test Scripts**: Add a long delay (e.g., 30 seconds) to keep the browser open longer

## Making All Browsers Visible

To ensure all browsers are visible, you can:

1. **Update Tool Implementations**: Ensure all tools respect the global `config.headless` setting
2. **Force Visible Mode**:
   ```typescript
   // In specific tool handlers
   await browserManager.getBrowser();
   // Replace with:
   await browserManager.getBrowser('chromium', { headless: false });
   ```

3. **Add Visibility Parameter**: Add a new `visible: boolean` parameter to all browser-related tools

## Testing AutoSpectra Tools with Visible Browsers

When you run AutoSpectra MCP tools, they should now use visible browsers because:

1. The `.env` file has `HEADLESS=false`
2. This sets `config.headless` to `false`
3. The `browserManager` uses this setting when launching browsers

However, if you're still not seeing visible browsers with MCP tools, you may need to modify the specific tool implementation to ensure it's respecting the global configuration.

## Conclusion

The current setup is already configured to use visible browsers with the `HEADLESS=false` setting, but actual visibility depends on how each tool is implemented and whether it respects this global setting.
