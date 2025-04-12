/**
 * Utilities for environment detection and configuration
 */

/**
 * Detect the current environment to adapt behavior accordingly
 */
export function detectEnvironment() {
  // Detect VSCode environment
  if (process.env.VSCODE_PID || process.env.VSCODE_CWD) {
    return 'vscode';
  }
  
  // Detect Cline environment (hypothetical)
  if (process.env.CLINE_VERSION) {
    return 'cline';
  }
  
  // Detect Cursor environment (hypothetical)
  if (process.env.CURSOR_APP) {
    return 'cursor';
  }
  
  // Default
  return 'generic';
}

/**
 * Get API key from the appropriate environment source
 */
export function getApiKeyForEnvironment(providedKey?: string) {
  if (providedKey) {
    return providedKey;
  }
  
  const env = detectEnvironment();
  
  switch (env) {
    case 'vscode':
      // VSCode extension might store API keys in its own storage
      return process.env.VSCODE_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
    case 'cline':
      // Similar for Cline
      return process.env.CLINE_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
    default:
      return process.env.ANTHROPIC_API_KEY;
  }
}
