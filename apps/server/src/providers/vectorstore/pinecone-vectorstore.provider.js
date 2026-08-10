import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../../config/pinecone.config.js';
export class PineconeVectorStoreProvider {
    pineconeClient;
    indexName;
    constructor(apiKey, indexName) {
        const finalApiKey = apiKey || pineconeConfig.apiKey;
        this.indexName = indexName || pineconeConfig.indexName || 'patent-embeddings';
        if (finalApiKey) {
            this.pineconeClient = new Pinecone({ apiKey: finalApiKey });
        }
    }
    async upsertVector(id, vector, metadata) {
        if (!this.pineconeClient) {
            throw new Error('Pinecone client not initialized');
        }
        const index = this.pineconeClient.index(this.indexName);
        await index.upsert({ records: [{ id, values: vector, metadata: metadata }] });
    }
    async upsertBatchVectors(vectors) {
        if (!this.pineconeClient) {
            throw new Error('Pinecone client not initialized');
        }
        const index = this.pineconeClient.index(this.indexName);
        const records = vectors.map((v) => ({ id: v.id, values: v.vector, metadata: v.metadata }));
        await index.upsert({ records });
    }
    async querySimilarity(vector, topK, filter) {
        if (!this.pineconeClient) {
            throw new Error('Pinecone client not initialized');
        }
        const index = this.pineconeClient.index(this.indexName);
        const res = await index.query({ vector, topK, filter: filter, includeMetadata: true });
        return (res.matches || []).map((match) => ({
            id: match.id,
            score: match.score ?? 0,
            metadata: match.metadata,
        }));
    }
    async deleteVector(id) {
        if (!this.pineconeClient) {
            throw new Error('Pinecone client not initialized');
        }
        const index = this.pineconeClient.index(this.indexName);
        if ('deleteOne' in index && typeof index.deleteOne === 'function') {
            await index.deleteOne(id);
        }
        else if ('deleteMany' in index && typeof index.deleteMany === 'function') {
            await index.deleteMany([id]);
        }
    }
}
//# sourceMappingURL=pinecone-vectorstore.provider.js.map