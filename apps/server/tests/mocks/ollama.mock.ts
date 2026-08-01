import { vi } from 'vitest';
import { mockVectorEmbedding } from '../fixtures/search.fixtures.js';
import { mockLLMRawResponse } from '../fixtures/rag.fixtures.js';

export function createOllamaMock() {
  const embedMock = vi.fn().mockResolvedValue({
    embeddings: [mockVectorEmbedding],
  });

  const generateMock = vi.fn().mockResolvedValue({
    response: mockLLMRawResponse,
  });

  return {
    embedMock,
    generateMock,
  };
}
