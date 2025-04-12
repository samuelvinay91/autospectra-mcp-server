import { AnthropicApiProvider } from './api';
import { ComputerUseProvider, ComputerUseResult } from './types';

/**
 * Factory function to get the appropriate computer use provider
 */
export function getProvider(
  type: 'api' | 'container', 
  options?: any
): ComputerUseProvider {
  switch (type) {
    case 'api':
      return new AnthropicApiProvider(options?.apiKey);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

export { ComputerUseProvider, ComputerUseResult } from './types';
