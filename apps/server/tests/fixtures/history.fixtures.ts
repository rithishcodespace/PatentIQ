import { mockNoveltyAnalysisReport } from './rag.fixtures.js';

export const mockHistoryRecordId = 'a540aa40-a25c-427c-8848-dea943861a3a';

export const mockHistoryRecord = {
  id: mockHistoryRecordId,
  userId: 'usr-12345',
  searchQuery: 'Autonomous drone navigation using LiDAR and optical flow sensors',
  topK: 5,
  appliedFilters: { ipc: 'B64C 39/02', country: 'US' },
  totalResults: 2,
  searchLatency: 155,
  createdAt: new Date('2026-08-01T10:00:00.000Z'),
  retrievedPatents: [
    {
      id: 'pat-001',
      searchHistoryId: mockHistoryRecordId,
      patentId: 'US-10112233-B2',
      title: 'Dual-sensor UAV obstacle detection system using LiDAR and optical flow',
      similarityScore: 0.92,
      ipc: 'B64C 39/02',
      country: 'US',
      publicationDate: '2023-05-12',
      owner: 'AeroTech Systems Inc.',
      metadata: {},
    },
  ],
  noveltyAnalysis: {
    id: 'nov-001',
    searchHistoryId: mockHistoryRecordId,
    summary: mockNoveltyAnalysisReport.summary,
    novelty: mockNoveltyAnalysisReport.novelAspects.join('; '),
    overlappingClaims: mockNoveltyAnalysisReport.overlappingClaims,
    recommendations: mockNoveltyAnalysisReport.recommendations,
    confidenceScore: 0.88,
    rawLLMResponse: 'raw llm text',
    generatedAt: new Date('2026-08-01T10:00:05.000Z'),
  },
};
