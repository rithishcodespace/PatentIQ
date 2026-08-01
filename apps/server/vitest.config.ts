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
      include: ['src/modules/search/**', 'src/modules/rag/**', 'src/modules/history/**'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'prisma/**',
        'src/modules/**/scripts/**',
        'src/modules/**/interfaces/**',
        'src/modules/**/dto/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
