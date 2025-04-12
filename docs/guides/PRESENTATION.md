# AutoSpectra MCP Server

## Enhanced Browser Automation for AI Assistants

---

## What is AutoSpectra?

AutoSpectra is a powerful MCP (Model Context Protocol) server that enables AI assistants to perform browser automation and testing tasks with **full visibility**. 

Key highlights:
- Browser automation with visible feedback
- Accessibility testing with visual violation highlighting
- Natural language to test code generation
- Self-healing test recording

---

## Core Features

### 🔍 Visual Browser Automation
- All browser interactions run in visible mode, not headless
- Works with Chromium, Firefox, and WebKit
- Slowed-down actions with visual feedback

### 🧪 Advanced Testing Capabilities
- Self-healing selectors that adapt to UI changes
- Accessibility testing with axe-core integration
- Visual comparison testing
- Test recording and generation

### 🤖 AI-Driven Testing
- Generate tests from plain English descriptions
- Multi-framework support (Playwright, Mocha, Jest)
- Support for JavaScript and TypeScript

---

## Visual Browser Automation

```javascript
// Navigate to a website with visible browser
await navigate({ url: "https://example.com" });

// Click on a button (visible to user)
await click({ selector: "#login-button" });

// Type into a form (visible to user)
await type({ 
  selector: "#username", 
  text: "testuser" 
});
```

The browser will be visible during each operation, showing exactly what's happening.

---

## Accessibility Testing

```javascript
// Check for accessibility issues with visual highlighting
await check_accessibility({
  rules: ["wcag2aa", "best-practice"],
  includeHidden: false
});
```

Results include:
- Visual highlighting of violations on the page
- WCAG reference information for each issue
- Screenshot capture with violations marked

---

## Natural Language Test Generation

```javascript
// Generate a test from a description
await generate_tests({
  url: "https://example.com/login",
  framework: "playwright",
  format: "javascript", 
  prompt: "Test the login form with valid and invalid credentials"
});
```

AI translates the prompt into complete test scripts with:
- Self-healing selectors
- Appropriate assertions
- Error handling

---

## Self-Healing Selectors

AutoSpectra generates multi-strategy selectors that try alternatives if the primary fails:

```javascript
await page.click([
  '#login-button',                    // First try ID
  '[data-testid="login-button"]',     // Then data-testid
  'button:has-text("Login")',         // Then text content
  '//button[contains(text(), "Login")]' // Finally XPath
].join(','));
```

This makes tests more resilient to UI changes.

---

## Integration with Smithery AI

### Setup Steps

1. **Build AutoSpectra MCP Server**
   ```bash
   npm install && npm run build
   ```

2. **Add to Smithery AI**
   - Navigate to Settings > Integrations
   - Add Custom Tool with appropriate configuration
   - Define tool schemas for each capability

3. **Test the Integration**
   - Create an agent that uses AutoSpectra
   - Run sample automation tasks

---

## Configuration for AI Platforms

### Smithery AI Configuration
```json
{
  "name": "autospectra",
  "displayName": "AutoSpectra Browser Automation",
  "description": "Browser automation with visible feedback",
  "executable": "node",
  "args": ["path/to/autospectra-mcp-server/build/index.js"],
  "env": {
    "DEBUG": "true",
    "HEADLESS": "false",
    "SLOW_MO": "500"
  }
}
```

---

### Claude Desktop Configuration

Add to `claude_desktop_config.json`:

```json
"autospectra": {
  "command": "node",
  "args": ["path/to/autospectra-mcp-server/build/index.js"],
  "env": {
    "DEBUG": "true",
    "HEADLESS": "false",
    "SLOW_MO": "500"
  },
  "disabled": false,
  "autoApprove": []
}
```

---

### Cline (VSCode) Configuration

Add to `cline_mcp_settings.json`:

```json
"autospectra": {
  "command": "node",
  "args": ["path/to/autospectra-mcp-server/build/index.js"],
  "env": {
    "DEBUG": "true",
    "HEADLESS": "false",
    "SLOW_MO": "500"
  },
  "disabled": false,
  "autoApprove": []
}
```

---

### Cursor Configuration

Add to AI settings:

```json
{
  "mcpServers": {
    "autospectra": {
      "command": "node",
      "args": ["path/to/autospectra-mcp-server/build/index.js"],
      "env": {
        "DEBUG": "true",
        "HEADLESS": "false",
        "SLOW_MO": "500"
      }
    }
  }
}
```

---

## Available MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `navigate` | Navigate to a URL |
| `click` | Click on an element |
| `type` | Type text into an input field |
| `extract` | Extract data from an element |
| `screenshot` | Take a screenshot |
| `check_accessibility` | Run accessibility tests |
| `generate_tests` | Generate test cases |
| `ai_process` | Process tasks with AI |
| `self_healing_record` | Record test sessions |
| `visual_comparison` | Compare screenshots |
| `list_frameworks` | List available frameworks |
| `run_test` | Run a generated test file |

---

## Demo Examples

### Basic Navigation
```javascript
await navigate({ url: "https://example.com" });
await click({ selector: "#login-button" });
await type({ selector: "#username", text: "testuser" });
```

### Accessibility Testing
```javascript
await check_accessibility({ rules: ["wcag2aa"] });
```

### Test Generation
```javascript
await generate_tests({
  url: "https://example.com/login",
  prompt: "Test the login form with valid credentials"
});
```

---

## Benefits for Different Users

### For Developers
- Quick testing of UI components
- Accessible development from day one
- Automatic test generation

### For QA Engineers
- Simplified test automation
- Visual feedback on test execution
- Self-healing tests reduce maintenance

### For Product Managers
- Direct interaction with testing via AI
- No coding required for basic tests
- Improved understanding of test coverage

---

## Future Roadmap

- Enhanced reporting and dashboards
- Integration with CI/CD pipelines
- Cross-device testing capabilities
- Performance testing metrics
- API integration testing
- Extended AI-driven test generation

---

## Documentation

Comprehensive documentation is available:

- README.md - General overview and setup
- QUICK_REFERENCE.md - Tool reference with examples
- docs/smithery-integration.md - Smithery AI integration details

---

## Questions?

Thank you for your attention!

For more information:
- GitHub: https://github.com/autospectra/autospectra-mcp-server
- Documentation: See README.md and docs/
- Support: Create issues on GitHub
