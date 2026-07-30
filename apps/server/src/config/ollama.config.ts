import { env } from './env.config.js';

export const ollamaConfig = {
  baseUrl: env.OLLAMA_BASE_URL,
  embeddingModel: env.OLLAMA_EMBEDDING_MODEL,
  llmModel: env.OLLAMA_LLM_MODEL,
};
