import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../../../config/pinecone.config.js';
import { ServiceUnavailableError, GatewayTimeoutError } from '../../../common/errors/http-errors.js';
export class SearchRepository {
    pineconeClient;
    indexName;
    maxRetries;
    constructor(apiKey, indexName, maxRetries = 3) {
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
    async retryWithBackoff(fn, operationName) {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (err) {
                lastError = err;
                if (attempt === this.maxRetries)
                    break;
                const delayMs = 500 * Math.pow(2, attempt - 1);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        throw lastError;
    }
    /**
     * Queries Pinecone vector database using query vector and optional metadata filters.
     */
    async querySimilarity(queryVector, topK, filter) {
        if (!this.pineconeClient) {
            throw new ServiceUnavailableError('Pinecone vector database is unavailable. PINECONE_API_KEY environment variable is missing.');
        }
        try {
            const index = this.pineconeClient.index(this.indexName);
            const queryPayload = {
                vector: queryVector,
                topK,
                includeMetadata: true,
            };
            if (filter && Object.keys(filter).length > 0) {
                queryPayload.filter = filter;
            }
            const queryResponse = await this.retryWithBackoff(async () => {
                return await index.query(queryPayload);
            }, 'Pinecone Query');
            const matches = queryResponse.matches || [];
            return matches.map((match) => ({
                id: match.id,
                score: match.score ?? 0,
                metadata: match.metadata,
            }));
        }
        catch (err) {
            if (err instanceof ServiceUnavailableError || err instanceof GatewayTimeoutError) {
                throw err;
            }
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('ETIMEDOUT') || msg.toLowerCase().includes('timeout')) {
                throw new GatewayTimeoutError(`Pinecone request timed out: ${msg}`);
            }
            throw new ServiceUnavailableError(`Pinecone vector database is unavailable: ${msg}`);
        }
    }
}
//# sourceMappingURL=search.repository.js.map