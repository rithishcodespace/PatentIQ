import type { IEmbeddingProvider } from './embedding-provider.interface.js';
import { ollamaConfig } from '../../config/ollama.config.js';

export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  constructor() {
    // TODO: Initialize Ollama client for nomic-embed-text model using ollamaConfig.baseUrl
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // TODO: Implement Ollama SDK client.embeddings({ model: ollamaConfig.embeddingModel, prompt: text })
    console.log(`[OllamaEmbeddingProvider] TODO: Generate embedding for text using model ${ollamaConfig.embeddingModel}`);
    return [];
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // TODO: Implement batch embedding calls using Ollama SDK
    console.log(`[OllamaEmbeddingProvider] TODO: Generate batch embeddings for ${texts.length} items`);
    return [];
  }
}
