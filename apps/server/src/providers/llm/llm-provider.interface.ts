export interface LLMCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ILLMProvider {
  generateCompletion(prompt: string, options?: LLMCompletionOptions): Promise<string>;
  analyzePriorArt(patentText: string, priorArtMatches: any[]): Promise<{
    noveltyScore: number;
    obviousnessScore: number;
    summary: string;
    keyDifferences: string[];
  }>;
}
