import { Ollama } from 'ollama';
import type { IEmbeddingProvider } from './embedding-provider.interface.js';
import { ollamaConfig } from '../../config/ollama.config.js';

export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  private ollama: Ollama;
  private model: string;

  constructor(baseUrl?: string, model?: string) {
    const host = baseUrl || ollamaConfig.baseUrl || 'http://localhost:11434';
    this.model = model || ollamaConfig.embeddingModel || 'nomic-embed-text';
    this.ollama = new Ollama({ host });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ollama.embed({
      model: this.model,
      input: text,
    });

    if (!response || !response.embeddings || response.embeddings.length === 0) {
      throw new Error(`Failed to generate embedding for input text.`);
    }

    const embedding = response.embeddings[0];
    if (!embedding) {
      throw new Error(`Received empty embedding vector from Ollama API.`);
    }

    return embedding;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.ollama.embed({
      model: this.model,
      input: texts,
    });

    if (!response || !response.embeddings) {
      throw new Error(`Failed to generate batch embeddings.`);
    }

    return response.embeddings;
  }
}
