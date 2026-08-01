import { vi } from 'vitest';
import { mockHistoryRecord } from '../fixtures/history.fixtures.js';

export function createPrismaMock() {
  const searchHistoryMock = {
    create: vi.fn().mockResolvedValue(mockHistoryRecord),
    findMany: vi.fn().mockResolvedValue([mockHistoryRecord]),
    findUnique: vi.fn().mockResolvedValue(mockHistoryRecord),
    findFirst: vi.fn().mockResolvedValue(mockHistoryRecord),
    count: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(mockHistoryRecord),
  };

  const retrievedPatentMock = {
    createMany: vi.fn().mockResolvedValue({ count: 2 }),
  };

  const noveltyAnalysisMock = {
    create: vi.fn().mockResolvedValue(mockHistoryRecord.noveltyAnalysis),
    findFirst: vi.fn().mockResolvedValue(mockHistoryRecord.noveltyAnalysis),
  };

  const prismaMock: any = {
    searchHistory: searchHistoryMock,
    retrievedPatent: retrievedPatentMock,
    noveltyAnalysis: noveltyAnalysisMock,
    $transaction: vi.fn(async (cb: any) => {
      if (typeof cb === 'function') {
        return cb(prismaMock);
      }
      return cb;
    }),
  };

  return {
    prismaMock,
    searchHistoryMock,
    retrievedPatentMock,
    noveltyAnalysisMock,
  };
}
