# AutoSpectra MCP Server Quick Reference

This document provides a concise reference of all the tools and capabilities available in the AutoSpectra MCP Server.

## Browser Automation Tools

### Basic Navigation and Interaction

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `navigate` | Navigate to a URL | `url`: The web address to navigate to |
| `click` | Click on an element | `selector`: CSS selector for the element to click |
| `type` | Type text into a field | `selector`: Element to type into<br>`text`: Text to type<br>`clearFirst`: Whether to clear field first |
| `extract` | Extract data from element | `selector`: Element to extract from<br>`attribute`: Attribute to extract (default: textContent) |
| `screenshot` | Take a screenshot | `fullPage`: Whether to capture full page (not just viewport) |

### Example Usage

```javascript
// Navigate to a website
await navigate({ url: "https://example.com" });

// Click on a button
await click({ selector: "#login-button" });

// Type into an input field
await type({ 
  selector: "input[name='username']", 
  text: "testuser", 
  clearFirst: true 
});

// Extract text from an element
const result = await extract({ selector: ".result-message" });

// Take a full-page screenshot
await screenshot({ fullPage: true });
```

## Testing Tools

### Accessibility Testing

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `check_accessibility` | Run accessibility tests | `rules`: Array of accessibility rules to check<br>`includeHidden`: Whether to check hidden elements |

#### Common Accessibility Rule Sets

- `wcag2a`: WCAG 2.0 Level A
- `wcag2aa`: WCAG 2.0 Level AA
- `wcag21a`: WCAG 2.1 Level A
- `wcag21aa`: WCAG 2.1 Level AA
- `section508`: Section 508 requirements
- `best-practice`: Best practices beyond formal standards

#### Example Usage

```javascript
// Basic accessibility check
await check_accessibility();

// Check with specific rule sets
await check_accessibility({
  rules: ["wcag2aa", "best-practice"],
  includeHidden: false
});
```

### Test Generation and Execution

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `generate_tests` | Create automated tests | `url`: Target URL<br>`framework`: Test framework<br>`format`: Output format<br>`prompt`: Test description |
| `run_test` | Execute a test file | `testPath`: Path to test file<br>`installDeps`: Whether to install dependencies |
| `list_frameworks` | List available frameworks | (No parameters) |

#### Supported Frameworks and Formats

- Frameworks: `playwright`, `mocha`, `jest`
- Formats: `javascript`, `typescript`
- Styles: `bdd`, `tdd`

#### Example Usage

```javascript
// Generate a test
await generate_tests({
  url: "https://example.com/login",
  framework: "playwright",
  format: "javascript",
  prompt: "Test the login form with valid credentials"
});

// Run a generated test
await run_test({
  testPath: "./output/login-test.js",
  installDeps: true
});
```

### Advanced Capabilities

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `self_healing_record` | Record test session | `url`: Starting URL<br>`outputFormat`: Framework format |
| `visual_comparison` | Compare screenshots | `url`: URL to screenshot<br>`baselinePath`: Reference image<br>`threshold`: Comparison threshold |
| `ai_process` | Generate steps from description | `task`: Description of task<br>`url`: Starting URL |

#### Example Usage

```javascript
// Start recording at a URL
await self_healing_record({
  url: "https://example.com",
  outputFormat: "playwright"
});

// Compare current page to baseline
await visual_comparison({
  url: "https://example.com/checkout",
  baselinePath: "./baseline/checkout.png",
  threshold: 0.1
});

// Process an automation task with AI
await ai_process({
  task: "Fill out the contact form with John Doe's information",
  url: "https://example.com/contact"
});
```

## Environment Variables Reference

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `PORT` | Server port | `3000` | HTTP port for API access |
| `DEBUG` | Enable logging | `false` | Set to `true` for verbose logging |
| `HEADLESS` | Hide browser | `false` | Set to `false` to show browser UI |
| `SLOW_MO` | Delay actions | `0` | Milliseconds to wait between actions |
| `OUTPUT_DIR` | Artifact location | `./output` | Where to save files & screenshots |

## Browser Specific Options

### Chromium (Default)

```javascript
// Chromium-specific options
browser = await chromium.launch({
  headless: false,
  slowMo: 500,
  args: ['--start-maximized', '--window-position=50,50']
});
```

### Firefox

```javascript
// Firefox-specific options
browser = await firefox.launch({
  headless: false,
  slowMo: 500,
  args: ['--start-maximized', '--window-position=50,50']
});
```

### WebKit

```javascript
// WebKit-specific options
browser = await webkit.launch({
  headless: false,
  slowMo: 500,
  args: ['--start-maximized', '--window-position=50,50']
});
```

## Self-Healing Selectors

AutoSpectra uses a multi-strategy approach to find elements, trying alternatives if the primary selector fails:

1. Exact CSS selector match
2. Data-testid attribute
3. Accessibility attributes
4. Text content
5. XPath location

Example of a generated self-healing selector:
```javascript
await page.click([
  '#login-button', // First try ID
  '[data-testid="login-button"]', // Then data-testid
  'button:has-text("Login")', // Then text content
  '//button[contains(text(), "Login")]' // Finally XPath
].join(','));
```

## Common Error Codes

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `ElementNotFound` | Selector didn't match any elements | Check selector, wait for element, or use self-healing selector |
| `NavigationFailed` | Couldn't navigate to URL | Check URL, network connection, or page load timeout |
| `TimeoutError` | Operation timed out | Increase timeout or check for blocking issues |
| `EvaluationError` | JavaScript execution failed | Check browser console for errors |
| `ProtocolError` | Browser connection issue | Restart browser instance |

## Recommended Practices

- **Always wait for navigation to complete** before interacting with elements
- **Use descriptive selectors** rather than complex XPath when possible
- **Take screenshots** after important steps for debugging
- **Check accessibility** regularly, not just at the end
- **Prefer self-healing selectors** for test reliability
- **Add proper timeouts** when dealing with dynamic content
