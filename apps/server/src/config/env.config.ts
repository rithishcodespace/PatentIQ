import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/patentiq?schema=public'),
  JWT_SECRET: z.string().default('patentiq_super_secret_jwt_key_2026'),
  PINECONE_API_KEY: z.string().default(''),
  PINECONE_INDEX_NAME: z.string().default('patent-embeddings'),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_EMBEDDING_MODEL: z.string().default('nomic-embed-text'),
  OLLAMA_LLM_MODEL: z.string().default('qwen2.5:3b'),
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  STORAGE_PATH: z.string().default('./storage/uploads'),
});

export const env = envSchema.parse(process.env);
