import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/modules/search/services/search.service.ts',
        'src/modules/search/mappers/search.mapper.ts',
        'src/modules/search/controllers/search.controller.ts',
        'src/modules/rag/services/novelty-analysis.service.ts',
        'src/modules/rag/services/rag.service.ts',
        'src/modules/rag/prompts/novelty-analysis.prompt.ts',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'prisma/**',
        '**/*.md',
        'src/modules/**/scripts/**',
        'src/modules/**/interfaces/**',
        'src/modules/**/dto/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 55,
        statements: 80,
      },
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
