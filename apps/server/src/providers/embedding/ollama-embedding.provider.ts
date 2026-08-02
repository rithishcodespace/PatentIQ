import { Ollama } from 'ollama';
import type { IEmbeddingProvider } from './embedding-provider.interface.js';
import { ollamaConfig } from '../../config/ollama.config.js';
import { InternalServerError, ServiceUnavailableError } from '../../common/errors/http-errors.js';

export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  private ollama: Ollama;
  private model: string;
  private maxRetries: number;
  private dimensions: number;

  constructor(baseUrl?: string, model?: string, maxRetries = 3, dimensions = 768) {
    const host = baseUrl || ollamaConfig.baseUrl || 'http://localhost:11434';
    this.model = model || ollamaConfig.embeddingModel || 'nomic-embed-text';
    this.ollama = new Ollama({ host });
    this.maxRetries = maxRetries;
    this.dimensions = dimensions;
  }

  getModelName(): string {
    return this.model;
  }

  getDimension(): number {
    return this.dimensions;
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        // Don't retry if it's a non-retryable error
        if (err.message && (err.message.includes('not found') || err.message.includes('404'))) {
          break;
        }
        if (attempt === this.maxRetries) break;
        const delayMs = 300 * Math.pow(2, attempt - 1);
        console.warn(`[OllamaEmbeddingProvider] Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    if (
      lastError?.code === 'ECONNREFUSED' ||
      lastError?.message?.includes('fetch failed') ||
      lastError?.message?.includes('ECONNREFUSED')
    ) {
      throw new ServiceUnavailableError(`Ollama embedding service unavailable at ${ollamaConfig.baseUrl || 'http://localhost:11434'}. Ensure Ollama is running.`);
    }

    throw new InternalServerError(`Ollama embedding generation failed: ${lastError?.message || 'Unknown error'}`);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const trimmed = text ? text.trim() : '';
    if (!trimmed) {
      throw new InternalServerError('Cannot generate embedding for empty text.');
    }

    return this.retryWithBackoff(async () => {
      const response = await this.ollama.embed({
        model: this.model,
        input: trimmed,
      });

      if (!response || !response.embeddings || response.embeddings.length === 0) {
        throw new InternalServerError('Failed to generate embedding: Ollama returned empty response.');
      }

      const embedding = response.embeddings[0];
      if (!embedding || embedding.length === 0) {
        throw new InternalServerError('Received empty embedding vector from Ollama API.');
      }

      return embedding;
    });
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) return [];

    const validIndices: number[] = [];
    const validPrompts: string[] = [];

    texts.forEach((text, index) => {
      const trimmed = text ? text.trim() : '';
      if (trimmed.length > 0) {
        validIndices.push(index);
        validPrompts.push(trimmed);
      }
    });

    const results: number[][] = new Array(texts.length).fill([]);
    if (validPrompts.length === 0) return results;

    return this.retryWithBackoff(async () => {
      const response = await this.ollama.embed({
        model: this.model,
        input: validPrompts,
      });

      if (!response || !response.embeddings) {
        throw new InternalServerError('Failed to generate batch embeddings from Ollama API.');
      }

      validIndices.forEach((originalIndex, i) => {
        results[originalIndex] = response.embeddings[i] || [];
      });

      return results;
    });
  }
}
