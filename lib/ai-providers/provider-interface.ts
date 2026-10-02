export interface AICompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  responseSchema?: any;
  temperature?: number;
}

export interface AICompletionResponse {
  content: string;
  json?: any;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface IAIProvider {
  name: string;
  generateText(request: AICompletionRequest): Promise<AICompletionResponse>;
  generateStructuredJson<T>(request: AICompletionRequest): Promise<T>;
}
