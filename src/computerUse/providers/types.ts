/**
 * Provider interfaces for computer use functionality
 */

export interface ComputerUseProvider {
  name: string;
  initialize(): Promise<void>;
  executeComputerTask(prompt: string, options?: any): Promise<ComputerUseResult>;
  cleanup(): Promise<void>;
}

export interface ComputerUseResult {
  text: string;
  images?: string[]; // Base64 encoded images
  toolUse?: any;
  error?: string;
  thinking?: string; // Thinking content from Claude's thinking property
}
