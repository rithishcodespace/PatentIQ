import { mockSearchResults } from './search.fixtures.js';
export const mockLLMRawResponse = JSON.stringify({
    summary: 'The proposed invention combines LiDAR depth estimation and optical flow velocity sensing to provide dual-sensor redundancy for autonomous drone navigation in GPS-denied environments.',
    similarPatents: [
        { patentId: 'US-10112233-B2', reason: 'Shares combined LiDAR and optical flow architecture for drone obstacle avoidance.' },
        { patentId: 'US-99887766-B1', reason: 'Discloses optical flow velocity estimation fused with laser range sensors.' },
    ],
    featureComparison: {
        commonFeatures: ['Optical flow sensor integration', 'LiDAR depth mapping', 'GPS-denied navigation'],
        uniqueFeatures: ['Dual-sensor adaptive kalman filtering under optical reflection loss'],
        partialOverlap: ['Range finder velocity calculations'],
    },
    novelAspects: [
        'Real-time dynamic sensor switching during optical flow degradation under low light.',
        'High-speed point-cloud alignment synchronized with optical flow vectors.',
    ],
    overlappingClaims: ['Claim 1 of US-10112233-B2 overlaps with the primary sensor fusion claim.'],
    risks: ['Prior art risk from US-10112233-B2 regarding dual-sensor spatial alignment.'],
    recommendations: ['Narrow claim 1 to specifically cover dynamic adaptive switching during optical reflection loss.'],
});
export const mockNoveltyAnalysisReport = {
    summary: 'The proposed invention combines LiDAR depth estimation and optical flow velocity sensing to provide dual-sensor redundancy for autonomous drone navigation in GPS-denied environments.',
    similarPatents: [
        { patentId: 'US-10112233-B2', reason: 'Shares combined LiDAR and optical flow architecture for drone obstacle avoidance.' },
        { patentId: 'US-99887766-B1', reason: 'Discloses optical flow velocity estimation fused with laser range sensors.' },
    ],
    featureComparison: {
        commonFeatures: ['Optical flow sensor integration', 'LiDAR depth mapping', 'GPS-denied navigation'],
        uniqueFeatures: ['Dual-sensor adaptive kalman filtering under optical reflection loss'],
        partialOverlap: ['Range finder velocity calculations'],
    },
    novelAspects: [
        'Real-time dynamic sensor switching during optical flow degradation under low light.',
        'High-speed point-cloud alignment synchronized with optical flow vectors.',
    ],
    overlappingClaims: ['Claim 1 of US-10112233-B2 overlaps with the primary sensor fusion claim.'],
    risks: ['Prior art risk from US-10112233-B2 regarding dual-sensor spatial alignment.'],
    recommendations: ['Narrow claim 1 to specifically cover dynamic adaptive switching during optical reflection loss.'],
};
export const mockRagAnalysisResult = {
    success: true,
    query: 'Autonomous drone navigation using LiDAR and optical flow sensors',
    retrievedPatents: mockSearchResults,
    analysis: mockNoveltyAnalysisReport,
    overlapAnalysis: [
        {
            patentId: 'US-10112233-B2',
            title: 'Dual-sensor UAV obstacle detection system using LiDAR and optical flow',
            similarityScore: 0.92,
            relevantSections: [
                {
                    section: 'abstract',
                    reason: 'Dual-sensor UAV obstacle detection system using LiDAR and optical flow',
                },
            ],
            overlappingClaims: [
                {
                    claimNumber: 1,
                    summary: 'Sensor fusion claim',
                    overlapStrength: 'High',
                    reason: 'Direct overlap on dual-sensor obstacle detection system',
                },
            ],
        },
    ],
    metrics: {
        retrievalTimeMs: 120,
        promptTimeMs: 15,
        llmInferenceTimeMs: 1200,
        totalTimeMs: 1335,
        retrievedCount: 2,
    },
};
//# sourceMappingURL=rag.fixtures.js.map