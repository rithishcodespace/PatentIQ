import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from '../../helpers/app.helper.js';
import { mockSearchRequest } from '../../fixtures/search.fixtures.js';
import { ServiceUnavailableError } from '../../../src/common/errors/http-errors.js';

describe('RAG API Integration Tests (POST /api/rag/analyze)', () => {
  let app: FastifyInstance;
  let mockRagService: any;

  beforeEach(async () => {
    const testSetup = await createTestApp();
    app = testSetup.app;
    mockRagService = testSetup.mockRagService;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /api/rag/analyze - should execute grounded 7-section novelty analysis', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/rag/analyze',
      payload: mockSearchRequest,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.analysis).toBeDefined();
    expect(body.analysis.summary).toBeDefined();
    expect(body.analysis.similarPatents).toBeDefined();
    expect(body.analysis.novelAspects).toBeDefined();
    expect(body.overlapAnalysis).toBeDefined();
  });

  it('POST /api/v1/rag/analyze - should support versioned API path', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/rag/analyze',
      payload: mockSearchRequest,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
  });

  it('POST /api/rag/analyze - should return 400 for missing query', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/rag/analyze',
      payload: { query: '' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('POST /api/rag/analyze - should handle Ollama LLM provider outage gracefully', async () => {
    mockRagService.analyze.mockRejectedValueOnce(
      new ServiceUnavailableError('Ollama Qwen LLM engine is unreachable')
    );

    const response = await app.inject({
      method: 'POST',
      url: '/api/rag/analyze',
      payload: mockSearchRequest,
    });

    expect(response.statusCode).toBe(503);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Service Unavailable');
  });
});
