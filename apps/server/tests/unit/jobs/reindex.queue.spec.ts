import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReindexQueue } from '../../../src/jobs/reindex.queue.js';

describe('ReindexQueue Unit Tests', () => {
  let mockPrisma: any;
  let mockEmbeddingsService: any;
  let reindexQueue: ReindexQueue;

  beforeEach(() => {
    mockPrisma = {
      patent: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'pat-1',
            title: 'Drone Sensor Fusion',
            abstract: 'Sensors for autonomous drone flight',
            claims: ['Claim 1: Sensor array'],
          },
        ]),
      },
    };

    mockEmbeddingsService = {
      generatePatentDocumentEmbeddings: vi.fn().mockResolvedValue({
        vector: new Array(768).fill(0.1),
        durationMs: 15,
      }),
    };

    reindexQueue = new ReindexQueue('redis://invalid-host-for-tests:6379', mockPrisma, mockEmbeddingsService);
  });

  afterEach(async () => {
    await reindexQueue.close();
  });

  it('should enqueue and trigger reindex background job using fallback when Redis is offline', async () => {
    const res = await reindexQueue.addReindexJob({ forceAll: true, batchSize: 10 });

    expect(res.jobId).toContain('reindex-job-');
    expect(res.queuedAt).toBeInstanceOf(Date);

    // Wait for in-memory fallback execution
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockPrisma.patent.findMany).toHaveBeenCalledWith({
      take: 10,
      select: { id: true, title: true, abstract: true, claims: true },
    });
    expect(mockEmbeddingsService.generatePatentDocumentEmbeddings).toHaveBeenCalled();
  });

  it('should return pending jobs count cleanly', async () => {
    const count = await reindexQueue.getPendingJobsCount();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
