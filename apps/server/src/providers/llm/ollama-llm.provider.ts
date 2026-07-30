import type { ILLMProvider, LLMCompletionOptions } from './llm-provider.interface.js';
import { ollamaConfig } from '../../config/ollama.config.js';

export class OllamaLLMProvider implements ILLMProvider {
  constructor() {
    // TODO: Initialize Ollama client instance using ollamaConfig.baseUrl and ollamaConfig.llmModel (qwen2.5:3b)
  }

  async generateCompletion(prompt: string, options?: LLMCompletionOptions): Promise<string> {
    // TODO: Implement Ollama SDK client.generate() or client.chat() with qwen2.5:3b
    console.log(`[OllamaLLMProvider] TODO: Generate completion using ${ollamaConfig.llmModel}`);
    return '';
  }

  async analyzePriorArt(patentText: string, priorArtMatches: any[]): Promise<{
    noveltyScore: number;
    obviousnessScore: number;
    summary: string;
    keyDifferences: string[];
  }> {
    // TODO: Implement prompt engineering & LLM invocation to analyze patent claims against prior art matches
    console.log(`[OllamaLLMProvider] TODO: Analyze prior art for patent against ${priorArtMatches.length} matches`);
    return {
      noveltyScore: 0,
      obviousnessScore: 0,
      summary: '',
      keyDifferences: [],
    };
  }
}
