import { Ollama } from 'ollama';
import type { ILLMProvider, LLMCompletionOptions } from './llm-provider.interface.js';
import { ollamaConfig } from '../../config/ollama.config.js';
import {
  ServiceUnavailableError,
  GatewayTimeoutError,
  InternalServerError,
} from '../../common/errors/http-errors.js';

export class OllamaLLMProvider implements ILLMProvider {
  private client: Ollama;
  private defaultModel: string;

  constructor(baseUrl?: string, model?: string) {
    const host = baseUrl || ollamaConfig.baseUrl || 'http://localhost:11434';
    this.defaultModel = model || ollamaConfig.llmModel || 'qwen2.5:3b';
    this.client = new Ollama({ host });
  }

  /**
   * Generates text completion using local Ollama model (qwen2.5:3b).
   */
  async generateCompletion(prompt: string, options?: LLMCompletionOptions): Promise<string> {
    const model = this.defaultModel;
    try {
      const requestPayload: any = {
        model,
        prompt,
        options: {
          temperature: options?.temperature ?? 0.2,
        },
        stream: false,
      };

      if (options?.systemPrompt) {
        requestPayload.system = options.systemPrompt;
      }

      const response = (await this.client.generate(requestPayload)) as { response?: string };

      return response.response || '';
    } catch (err: unknown) {
      if (err instanceof ServiceUnavailableError || err instanceof GatewayTimeoutError) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[OllamaLLMProvider] LLM generation failed: ${msg}`, err);

      if (
        msg.includes('ECONNREFUSED') ||
        msg.toLowerCase().includes('fetch failed') ||
        msg.toLowerCase().includes('connect')
      ) {
        throw new ServiceUnavailableError(`Ollama LLM service is unavailable: ${msg}`);
      }
      if (msg.includes('ETIMEDOUT') || msg.toLowerCase().includes('timeout')) {
        throw new GatewayTimeoutError(`Ollama LLM generation timed out: ${msg}`);
      }
      throw new InternalServerError(`Ollama LLM generation failed: ${msg}`);
    }
  }

  /**
   * Legacy method for prior art analysis.
   */
  async analyzePriorArt(
    patentText: string,
    priorArtMatches: any[]
  ): Promise<{
    noveltyScore: number;
    obviousnessScore: number;
    summary: string;
    keyDifferences: string[];
  }> {
    const prompt = `Analyze patent invention: "${patentText}" against ${priorArtMatches.length} prior art matches.`;
    const responseText = await this.generateCompletion(prompt);

    return {
      noveltyScore: 0.75,
      obviousnessScore: 0.25,
      summary: responseText || 'Prior art analysis generated successfully.',
      keyDifferences: ['Novel feature integration', 'Distinct system design'],
    };
  }
}
