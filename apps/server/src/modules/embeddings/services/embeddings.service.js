import { BadRequestError } from '../../../common/errors/http-errors.js';
export class EmbeddingsService {
    embeddingProvider;
    vectorStoreProvider;
    constructor(embeddingProvider, vectorStoreProvider) {
        this.embeddingProvider = embeddingProvider;
        this.vectorStoreProvider = vectorStoreProvider;
    }
    async generateAndStoreEmbedding(dto) {
        if (!this.vectorStoreProvider) {
            throw new Error('VectorStoreProvider is required for vector storage operations.');
        }
        const vector = await this.embeddingProvider.generateEmbedding(dto.text);
        const vectorId = dto.patentId ? `${dto.patentId}-${dto.section ?? 'full'}` : `vec-${Date.now()}`;
        await this.vectorStoreProvider.upsertVector(vectorId, vector, {
            patentId: dto.patentId,
            section: dto.section,
        });
        return { vectorId, dimension: vector.length };
    }
    async generateBatchAndStoreEmbeddings(dto) {
        if (!this.vectorStoreProvider) {
            throw new Error('VectorStoreProvider is required for vector storage operations.');
        }
        const vectors = await this.embeddingProvider.generateBatchEmbeddings(dto.texts);
        const items = vectors.map((v, idx) => ({
            id: `${dto.patentId ?? 'batch'}-${idx}`,
            vector: v,
        }));
        await this.vectorStoreProvider.upsertBatchVectors(items);
        return { count: items.length };
    }
    /**
     * Generates section-wise embeddings for a StandardPatentDocument using the configured embedding provider.
     * Embeddings are held in memory for the request duration and returned as metadata.
     */
    async generatePatentDocumentEmbeddings(doc) {
        const startTime = Date.now();
        if (!doc) {
            throw new BadRequestError('Standard patent document is required for embedding generation.');
        }
        const { title, abstract, claims, fullText } = doc;
        const sectionsToEmbed = [];
        if (title && title.trim().length > 0)
            sectionsToEmbed.push({ section: 'title', text: title });
        if (abstract && abstract.trim().length > 0)
            sectionsToEmbed.push({ section: 'abstract', text: abstract });
        if (claims && claims.trim().length > 0)
            sectionsToEmbed.push({ section: 'claims', text: claims });
        if (sectionsToEmbed.length === 0) {
            throw new BadRequestError('Patent document contains no valid text sections (title, abstract, claims) for embedding.');
        }
        const modelName = this.embeddingProvider.getModelName ? this.embeddingProvider.getModelName() : 'nomic-embed-text';
        const dimension = this.embeddingProvider.getDimension ? this.embeddingProvider.getDimension() : 768;
        console.log(`[EmbeddingsService] Embedding generation started for sections [${sectionsToEmbed.map((s) => s.section).join(', ')}] using model '${modelName}'`);
        const texts = sectionsToEmbed.map((s) => s.text);
        let batchVectors;
        try {
            batchVectors = await this.embeddingProvider.generateBatchEmbeddings(texts);
        }
        catch (err) {
            console.error(`[EmbeddingsService] Embedding generation failed: ${err.message}`);
            throw err;
        }
        const vectorsMap = {};
        sectionsToEmbed.forEach((item, index) => {
            vectorsMap[item.section] = batchVectors[index] || [];
        });
        // Optionally generate combined fullText embedding if present
        if (fullText && fullText.trim().length > 0) {
            try {
                const fullTextVector = await this.embeddingProvider.generateEmbedding(fullText);
                vectorsMap['fullText'] = fullTextVector;
            }
            catch (err) {
                console.warn(`[EmbeddingsService] Optional fullText combined embedding failed: ${err.message}`);
            }
        }
        const generationTimeMs = Date.now() - startTime;
        const sectionNames = Object.keys(vectorsMap).filter((k) => k !== 'fullText');
        console.log(`[EmbeddingsService] Embedding generation completed in ${generationTimeMs}ms. Model: '${modelName}', Dimensions: ${dimension}, Sections: [${sectionNames.join(', ')}]`);
        return {
            model: modelName,
            dimensions: dimension,
            sections: sectionNames,
            generatedAt: new Date().toISOString(),
            vectors: vectorsMap,
        };
    }
}
//# sourceMappingURL=embeddings.service.js.map