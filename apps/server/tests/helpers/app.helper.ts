import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { vi } from 'vitest';
import { mockSearchResults } from '../fixtures/search.fixtures.js';
import { mockRagAnalysisResult } from '../fixtures/rag.fixtures.js';
import { mockHistoryRecord } from '../fixtures/history.fixtures.js';

export async function createTestApp(): Promise<{
  app: FastifyInstance;
  mockSearchService: any;
  mockRagService: any;
  mockHistoryService: any;
}> {
  const app = await buildApp();

  const mockSearchService = {
    search: vi.fn().mockResolvedValue({
      success: true,
      query: 'Autonomous drone navigation using LiDAR and optical flow sensors',
      count: 2,
      searchHistoryId: mockHistoryRecord.id,
      filters: { ipc: 'B64C 39/02', country: 'US' },
      results: mockSearchResults,
      metrics: {
        queryEmbeddingTimeMs: 35,
        pineconeSearchTimeMs: 95,
        totalExecutionTimeMs: 130,
        totalResults: 2,
      },
    }),
    searchPriorArt: vi.fn().mockResolvedValue([]),
    generateEmbedding: vi.fn().mockResolvedValue({ embedding: new Array(768).fill(0.1), durationMs: 20 }),
  };

  const mockRagService = {
    analyze: vi.fn().mockResolvedValue(mockRagAnalysisResult),
    rankCandidates: vi.fn().mockResolvedValue([]),
  };

  const mockHistoryService = {
    getHistory: vi.fn().mockResolvedValue({
      history: [mockHistoryRecord],
      pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    }),
    getHistoryById: vi.fn().mockResolvedValue(mockHistoryRecord),
    deleteHistoryRecord: vi.fn().mockResolvedValue({
      success: true,
      message: `Search history record '${mockHistoryRecord.id}' successfully deleted`,
    }),
    findReusableAnalysis: vi.fn().mockResolvedValue(null),
    saveSearchHistory: vi.fn().mockResolvedValue({ id: mockHistoryRecord.id }),
    saveSearchAndAnalysisAtomically: vi.fn().mockResolvedValue({ id: mockHistoryRecord.id }),
  };

  if (app.diContainer) {
    app.diContainer.services.searchService = mockSearchService;
    app.diContainer.services.ragService = mockRagService;
    app.diContainer.services.historyService = mockHistoryService;

    if (app.diContainer.controllers) {
      if (app.diContainer.controllers.search) {
        app.diContainer.controllers.search['searchService'] = mockSearchService;
      }
      if (app.diContainer.controllers.rag) {
        app.diContainer.controllers.rag['ragService'] = mockRagService;
      }
      if (app.diContainer.controllers.history) {
        app.diContainer.controllers.history['historyService'] = mockHistoryService;
      }
    }
  }

  await app.ready();

  return {
    app,
    mockSearchService,
    mockRagService,
    mockHistoryService,
  };
}
