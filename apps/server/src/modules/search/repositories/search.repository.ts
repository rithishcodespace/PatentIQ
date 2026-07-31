import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../../../config/pinecone.config.js';
import type { ISearchRepository, PineconeMatchResult, PineconeVectorMetadata } from '../interfaces/search.interface.js';

export class SearchRepository implements ISearchRepository {
  private pineconeClient?: Pinecone;
  private indexName: string;
  private maxRetries: number;

  constructor(apiKey?: string, indexName?: string, maxRetries = 3) {
    const finalApiKey = apiKey || pineconeConfig.apiKey;
    this.indexName = indexName || pineconeConfig.indexName || 'patent-embeddings';
    this.maxRetries = maxRetries;

    if (finalApiKey) {
      this.pineconeClient = new Pinecone({ apiKey: finalApiKey });
    }
  }

  /**
   * Retries an async operation with exponential backoff.
   */
  private async retryWithBackoff<T>(fn: () => Promise<T>, operationName: string): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt === this.maxRetries) break;
        const delayMs = 500 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
  }

  /**
   * Queries Pinecone index using input query vector.
   */
  async querySimilarity(queryVector: number[], topK: number): Promise<PineconeMatchResult[]> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client is not initialized. Please verify PINECONE_API_KEY environment variable.');
    }

    const index = this.pineconeClient.index<PineconeVectorMetadata>(this.indexName);

    const queryResponse = await this.retryWithBackoff(async () => {
      return await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
      });
    }, 'Pinecone Query');

    const matches = queryResponse.matches || [];

    return matches.map((match) => ({
      id: match.id,
      score: match.score ?? 0,
      metadata: match.metadata as PineconeVectorMetadata | undefined,
    }));
  }
}
