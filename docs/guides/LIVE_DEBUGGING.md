# Live Debugging and Test Development with AutoSpectra

This guide explains how to use AutoSpectra MCP server for live debugging and test development with visible browsers.

## Using Visible Browsers for Debugging

The `visible: true` parameter in all browser automation tools enables real-time observation and debugging:

```javascript
// Use visible browser mode for debugging
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: {
    url: "https://example.com",
    visible: true
  }
});
```

## Interactive Development Workflow

### Step 1: Initial Exploration with Visible Browser

Use the MCP tools with visible mode to explore the application:

```javascript
// Navigate with visible browser
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: {
    url: "https://your-app.com",
    visible: true
  }
});

// Extract data to see what's available
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "extract",
  arguments: {
    selector: ".some-element",
    visible: true
  }
});
```

### Step 2: Generate Initial Test

```javascript
// Generate a test based on exploration
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "generate_tests",
  arguments: {
    url: "https://your-app.com",
    framework: "playwright",
    format: "javascript",
    prompt: "Test the login functionality"
  }
});
```

### Step 3: Modify and Debug Test

Edit the generated test file to add breakpoints, console logs, or test-specific logic.

```javascript
// Add these to your test for debugging
page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

// Add a pause for debugging
// Use debugger statement to pause in dev tools
await page.evaluate(() => {
  debugger;
});
```

### Step 4: Run with Developer Tools

Run your test with the `--debug` flag to enable DevTools:

```bash
# Run with inspector
node --inspect-brk output/your-test.js

# For Playwright tests with inspector
npx playwright test --debug
```

## Setting Up Watch Mode for Development

Create a `watch-test.js` script for live reloading:

```javascript
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

// File to watch
const testFile = process.argv[2] || 'output/simple-playwright-test.js';

console.log(`Watching ${testFile} for changes...`);

// Start watching
chokidar.watch(testFile).on('change', (filePath) => {
  console.log(`File ${path.basename(filePath)} changed, running test...`);
  
  // Run the test
  const child = exec(`node ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Test output: ${stdout}`);
  });
  
  // Stream output
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
});

console.log('Watcher started! Edit your test file to trigger a run.');
```

Install the dependency:

```bash
npm install chokidar
```

Then run:

```bash
node watch-test.js output/your-test.js
```

## Using Playwright Inspector

Playwright provides a built-in visual debugger. Add this to your test:

```javascript
// Trigger Playwright Inspector
await page.pause();
```

## Debugging with VS Code

1. Create a `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test",
      "program": "${file}",
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Playwright Test",
      "program": "${workspaceFolder}/node_modules/.bin/playwright",
      "args": ["test", "${relativeFile}"],
      "console": "integratedTerminal"
    }
  ]
}
```

2. Set breakpoints in your test file
3. Press F5 to start debugging
4. Use the VS Code debugger controls to step through the code

## Leveraging Visible Browser Mode with DevTools

When using `visible: true`, you can also interact with the browser's DevTools:

1. Right-click in the visible browser and select "Inspect"
2. Use the Elements tab to inspect the DOM
3. Use the Console tab to run JavaScript
4. Use the Network tab to monitor requests

This provides a powerful way to debug tests while they're running.

## Combining with Cline's Browser Tools

For more interactive debugging, combine AutoSpectra with Cline's browser_action:

```javascript
// Use Cline for visual exploration
browser_action({ action: "launch", url: "http://localhost:3000" });
browser_action({ action: "click", coordinate: "450,300" });
browser_action({ action: "close" });

// Then use AutoSpectra for automated tests
use_mcp_tool({
  server_name: "autospectra",
  tool_name: "navigate",
  arguments: { url: "http://localhost:3000", visible: true }
});
```

This workflow allows you to visually identify elements before automating them in your tests.
