# Computer Use Tools

AutoSpectra MCP server now includes Claude's computer use capabilities with a flexible, hybrid approach that supports both API-only and container-based implementations.

## Overview

The computer use integration offers two provider types:

1. **API-Only Provider**: Uses Claude's computer use API directly - simpler, no additional infrastructure required
2. **Container-Based Provider**: Uses a Docker container with a full Linux environment - more powerful, requires Docker

Both providers are accessed through the same interface, allowing you to choose the approach that best fits your needs.

## Prerequisites

### API-Only Provider

- Anthropic API key with computer use access
- Set the `ANTHROPIC_API_KEY` environment variable or provide it directly

### Container-Based Provider

- Docker installed and running
- Anthropic API key with computer use access
- Set the `ANTHROPIC_API_KEY` environment variable or provide it directly

## Tool Reference

### initialize_computer

Initializes a computer use provider with the specified configuration.

```typescript
initialize_computer({
  type: 'api' | 'container',  // Provider type
  apiKey?: string,            // Optional Anthropic API key
  containerImage?: string,    // Optional container image to use (for container provider)
  width?: number,             // Optional screen width (for container provider)
  height?: number             // Optional screen height (for container provider)
})
```

### use_computer

Uses the initialized computer use provider to perform a task.

```typescript
use_computer({
  prompt: string,  // Description of the computer task to perform
  model?: string   // Optional Claude model to use (default: claude-3-7-sonnet-20240307)
})
```

### smart_computer_use

Uses the initialized computer use provider with fallback to AutoSpectra automation tools if needed.

```typescript
smart_computer_use({
  prompt: string,       // Description of the computer task to perform
  useAutomation?: boolean, // Whether to fall back to automation tools if computer use fails (default: true)
  model?: string        // Optional Claude model to use (default: claude-3-7-sonnet-20240307)
})
```

### cleanup_computer

Cleans up any resources used by the computer use provider.

```typescript
cleanup_computer()
```

## Usage Examples

### API-Only Provider Example

```javascript
// Initialize the API provider
await initialize_computer({ type: 'api' });

// Use computer capabilities
await use_computer({ 
  prompt: "Create a new text document with today's date and save it as today.txt" 
});

// Clean up when done
await cleanup_computer();
```

### Container-Based Provider Example

```javascript
// Initialize the container provider
await initialize_computer({ 
  type: 'container',
  width: 1280,
  height: 800
});

// Use computer capabilities
await use_computer({ 
  prompt: "Open Firefox, navigate to wikipedia.org, and search for 'artificial intelligence'" 
});

// Clean up when done
await cleanup_computer();
```

### Smart Computer Use Example

```javascript
// Initialize any provider
await initialize_computer({ type: 'api' });

// Use smart computer capabilities with automation fallback
await smart_computer_use({ 
  prompt: "Navigate to google.com and search for 'Claude computer use'",
  useAutomation: true
});

// Clean up when done
await cleanup_computer();
```

## Integration with Existing Tools

The computer use capabilities integrate with AutoSpectra's existing automation tools, providing a seamless experience that can fall back to more traditional automation when needed.

### Fallback Logic

When using `smart_computer_use`, if the computer use provider fails to complete the task, it will automatically attempt to:

1. Parse the intent from the prompt
2. Identify the appropriate automation action (navigation, clicking, typing, etc.)
3. Execute that action using AutoSpectra's existing automation tools

This ensures robustness and flexibility even when computer use capabilities are limited.

## Environment Support

The implementation automatically detects and adapts to different environments:

- VSCode
- Cline
- Cursor
- Other IDEs and applications

This allows the computer use capabilities to work across different contexts with minimal configuration.
