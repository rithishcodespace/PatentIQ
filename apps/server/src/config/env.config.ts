import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Resolve apps/server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// Uncomment these temporarily for debugging
// console.log('cwd:', process.cwd());
// console.log('dotenv path:', path.resolve(__dirname, '../../.env'));
// console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:Rithish@2006@localhost:5432/patent_iq?schema=public'),
  JWT_SECRET: z.string().default('patentiq_super_secret_jwt_key_2026'),
  PINECONE_API_KEY: z.string().default(''),
  PINECONE_INDEX_NAME: z.string().default('patent-embeddings'),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_EMBEDDING_MODEL: z.string().default('nomic-embed-text'),
  OLLAMA_LLM_MODEL: z.string().default('qwen2.5:3b'),
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  STORAGE_PATH: z.string().default('./storage/uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(20),
  DEFAULT_TOP_K: z.coerce.number().default(10),
  BENCHMARK_ITERATIONS: z.coerce.number().default(5),
  ENABLE_QUERY_CACHE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
});

export const env = envSchema.parse(process.env);