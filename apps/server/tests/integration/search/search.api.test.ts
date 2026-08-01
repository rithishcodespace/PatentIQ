import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from '../../helpers/app.helper.js';
import { mockSearchRequest } from '../../fixtures/search.fixtures.js';
import { ServiceUnavailableError } from '../../../src/common/errors/http-errors.js';

describe('Search API Integration Tests (POST /api/search)', () => {
  let app: FastifyInstance;
  let mockSearchService: any;

  beforeEach(async () => {
    const testSetup = await createTestApp();
    app = testSetup.app;
    mockSearchService = testSetup.mockSearchService;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /api/search - should execute successful semantic search', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: mockSearchRequest,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.query).toBe(mockSearchRequest.query);
    expect(body.results).toHaveLength(2);
    expect(body.results[0].rank).toBe(1);
    expect(body.results[0].patentId).toBe('US-10112233-B2');
    expect(body.metrics).toBeDefined();
  });

  it('POST /api/v1/search - should support versioned API path', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/search',
      payload: mockSearchRequest,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
  });

  it('POST /api/search - should return 400 for empty search query', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: { query: '' },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Bad Request');
    expect(body.message).toContain('query');
  });

  it('POST /api/search - should return 400 for invalid topK (> 100 or < 1)', async () => {
    const responseLow = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: { query: 'drone navigation', topK: 0 },
    });
    expect(responseLow.statusCode).toBe(400);

    const responseHigh = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: { query: 'drone navigation', topK: 150 },
    });
    expect(responseHigh.statusCode).toBe(400);
  });

  it('POST /api/search - should handle empty Pinecone search results', async () => {
    mockSearchService.search.mockResolvedValueOnce({
      success: true,
      query: 'obscure query',
      count: 0,
      results: [],
      metrics: { totalResults: 0, totalExecutionTimeMs: 40 },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: { query: 'obscure query' },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.count).toBe(0);
    expect(body.results).toEqual([]);
  });

  it('POST /api/search - should handle Pinecone service failure with proper error code', async () => {
    mockSearchService.search.mockRejectedValueOnce(
      new ServiceUnavailableError('Pinecone vector database is unavailable')
    );

    const response = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: mockSearchRequest,
    });

    expect(response.statusCode).toBe(503);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Service Unavailable');
    expect(body.message).toContain('Pinecone vector database');
  });
});
