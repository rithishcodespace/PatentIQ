import { env } from './env.config.js';

export const pineconeConfig = {
  apiKey: env.PINECONE_API_KEY,
  indexName: env.PINECONE_INDEX_NAME,
  dimension: 768, // Default for nomic-embed-text
  metric: 'cosine' as const,
};
