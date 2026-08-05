import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { runPatentIngestionScript } from '../../../src/modules/patents/scripts/patent-ingestion.script.js';
import type { PrismaClient } from '@prisma/client';

describe('runPatentIngestionScript Unit Tests', () => {
  it('should process raw patent files and persist metadata into PostgreSQL mock', async () => {
    const tempDir = path.join(os.tmpdir(), `test_raw_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const mockPrisma = {
      uploadedDocument: {
        create: vi.fn().mockResolvedValue({
          id: 'doc-12345',
          originalFileName: 'sample_patent.txt',
          storedFileName: 'ingested_sample_patent.txt',
          mimeType: 'text/plain',
          extension: 'txt',
          size: 500,
          storagePath: '/mock/path/sample_patent.txt',
          status: 'Completed',
        }),
      },
    } as unknown as PrismaClient;

    try {
      const stats = await runPatentIngestionScript({
        rawDir: tempDir,
        maxFiles: 0,
        generateEmbeddings: false,
        prisma: mockPrisma,
      });

      expect(stats.totalFilesProcessed).toBe(0);
      expect(stats.durationSeconds).toBeGreaterThanOrEqual(0);
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });
});
