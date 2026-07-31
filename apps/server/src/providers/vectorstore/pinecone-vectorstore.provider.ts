import { Pinecone, type RecordMetadata } from '@pinecone-database/pinecone';
import type { IVectorStoreProvider, VectorMatch } from './vectorstore-provider.interface.js';
import { pineconeConfig } from '../../config/pinecone.config.js';

export class PineconeVectorStoreProvider implements IVectorStoreProvider {
  private pineconeClient?: Pinecone;
  private indexName: string;

  constructor(apiKey?: string, indexName?: string) {
    const finalApiKey = apiKey || pineconeConfig.apiKey;
    this.indexName = indexName || pineconeConfig.indexName || 'patent-embeddings';

    if (finalApiKey) {
      this.pineconeClient = new Pinecone({ apiKey: finalApiKey });
    }
  }

  async upsertVector(id: string, vector: number[], metadata?: Record<string, any>): Promise<void> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client not initialized');
    }
    const index = this.pineconeClient.index<RecordMetadata>(this.indexName);
    await index.upsert({ records: [{ id, values: vector, metadata: metadata as RecordMetadata }] });
  }

  async upsertBatchVectors(vectors: { id: string; vector: number[]; metadata?: Record<string, any> }[]): Promise<void> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client not initialized');
    }
    const index = this.pineconeClient.index<RecordMetadata>(this.indexName);
    const records = vectors.map((v) => ({ id: v.id, values: v.vector, metadata: v.metadata as RecordMetadata }));
    await index.upsert({ records });
  }

  async querySimilarity(vector: number[], topK: number, filter?: Record<string, any>): Promise<VectorMatch[]> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client not initialized');
    }
    const index = this.pineconeClient.index<RecordMetadata>(this.indexName);
    const res = await index.query({ vector, topK, filter: filter as any, includeMetadata: true });
    return (res.matches || []).map((match) => ({
      id: match.id,
      score: match.score ?? 0,
      metadata: match.metadata as Record<string, any>,
    }));
  }

  async deleteVector(id: string): Promise<void> {
    if (!this.pineconeClient) {
      throw new Error('Pinecone client not initialized');
    }
    const index = this.pineconeClient.index<RecordMetadata>(this.indexName);
    if ('deleteOne' in index && typeof (index as any).deleteOne === 'function') {
      await (index as any).deleteOne(id);
    } else if ('deleteMany' in index && typeof (index as any).deleteMany === 'function') {
      await (index as any).deleteMany([id]);
    }
  }
}
