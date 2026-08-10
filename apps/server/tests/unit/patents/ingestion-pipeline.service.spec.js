import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IngestionPipelineService } from '../../../src/modules/patents/services/ingestion-pipeline.service.js';
describe('IngestionPipelineService Unit Tests', () => {
    let mockPrisma;
    let mockParserService;
    let mockEmbeddingProvider;
    let mockVectorStoreProvider;
    let service;
    beforeEach(() => {
        mockPrisma = {
            uploadedDocument: {
                create: vi.fn().mockResolvedValue({ id: 'doc-123' }),
            },
        };
        mockParserService = {
            parsePdf: vi.fn(),
            parseDocx: vi.fn(),
            parseCsvOrText: vi.fn().mockResolvedValue({
                title: 'Quantum Computing Encryption Patent',
                abstract: 'Method for cryptographic security using quantum key distribution.',
                ipcClassifications: ['H04L 9/08'],
            }),
        };
        mockEmbeddingProvider = {
            generateEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.05)),
        };
        mockVectorStoreProvider = {
            upsertVector: vi.fn().mockResolvedValue(undefined),
        };
        service = new IngestionPipelineService(mockPrisma, mockParserService, mockEmbeddingProvider, mockVectorStoreProvider);
    });
    afterEach(() => {
        service.stopSchedule();
    });
    it('should initialize status in idle state', () => {
        const status = service.getPipelineStatus();
        expect(status.status).toBe('idle');
        expect(status.stage).toBe('idle');
        expect(status.progressPercent).toBe(0);
        expect(status.processedCount).toBe(0);
    });
    it('should trigger pipeline run and handle file processing', async () => {
        const initialStatus = await service.triggerPipelineRun({
            rawDir: '/tmp/test_ingestion_empty_dir',
            batchSize: 5,
        });
        expect(initialStatus.status).toBe('running');
        // Wait for background execution loop to complete
        await new Promise((resolve) => setTimeout(resolve, 50));
        const finalStatus = service.getPipelineStatus();
        expect(finalStatus.status).toBe('completed');
        expect(finalStatus.progressPercent).toBe(100);
    });
    it('should configure schedule timer correctly', () => {
        service.configureSchedule(30, true);
        const status = service.getPipelineStatus();
        expect(status.nextScheduledRunTimestamp).toBeInstanceOf(Date);
        // Disable schedule
        service.configureSchedule(30, false);
        const updatedStatus = service.getPipelineStatus();
        expect(updatedStatus.nextScheduledRunTimestamp).toBeUndefined();
    });
});
//# sourceMappingURL=ingestion-pipeline.service.spec.js.map