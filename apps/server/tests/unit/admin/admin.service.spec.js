import { describe, it, expect, vi } from 'vitest';
import { AdminService } from '../../../src/modules/admin/services/admin.service.js';
describe('AdminService Unit Tests', () => {
    const mockVectorStore = {
        upsertVector: vi.fn(),
        upsertBatchVectors: vi.fn(),
        querySimilarity: vi.fn().mockResolvedValue([]),
        deleteVector: vi.fn(),
    };
    const mockLLM = {
        generateCompletion: vi.fn().mockResolvedValue('pong'),
        analyzePriorArt: vi.fn(),
    };
    const mockCacheProvider = {
        isAvailable: vi.fn().mockReturnValue(true),
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
        flush: vi.fn().mockResolvedValue(undefined),
    };
    const mockPrisma = {
        $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
        uploadedDocument: {
            count: vi.fn().mockResolvedValue(2),
        },
        patent: {
            findMany: vi.fn().mockResolvedValue([]),
        },
    };
    const adminService = new AdminService(mockVectorStore, mockLLM, mockCacheProvider, mockPrisma);
    it('should return system status with active health pings to PostgreSQL, Ollama, and Pinecone', async () => {
        const status = await adminService.getSystemStatus();
        expect(status.databaseHealthy).toBe(true);
        expect(status.pineconeHealthy).toBe(true);
        expect(status.pendingJobsCount).toBe(2);
    });
    it('should trigger embedding re-index job', async () => {
        const res = await adminService.triggerReindex({ forceAll: true, batchSize: 20 });
        expect(res.jobId).toContain('reindex-job-');
        expect(res.queuedAt).toBeInstanceOf(Date);
    });
    it('should flush Redis database and return true on clearCache', async () => {
        const success = await adminService.clearCache();
        expect(success).toBe(true);
        expect(mockCacheProvider.flush).toHaveBeenCalled();
    });
});
//# sourceMappingURL=admin.service.spec.js.map