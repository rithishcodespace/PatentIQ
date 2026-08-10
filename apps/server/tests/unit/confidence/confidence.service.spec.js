import { describe, it, expect, beforeEach } from 'vitest';
import { ConfidenceService } from '../../../src/modules/confidence/services/confidence.service.js';
import { ConfidenceCalculatorUtil } from '../../../src/modules/confidence/utils/confidence-calculator.util.js';
describe('ConfidenceService Unit Tests', () => {
    let confidenceService;
    const mockSearchResults = [
        {
            rank: 1,
            score: 0.92,
            patentId: 'US-9876543-B2',
            title: 'Autonomous Navigation System',
            abstract: 'LiDAR optical flow sensor fusion.',
            claims: 'Claim 1: An autonomous vehicle navigation system comprising LiDAR.',
            ipc: 'G05D1/02',
            country: 'US',
            owner: 'Tech Corp',
            publicationDate: '2023-05-15',
        },
        {
            rank: 2,
            score: 0.84,
            patentId: 'EP-1234567-A1',
            title: 'Drone Sensor Fusion',
            abstract: 'Optical flow navigation method.',
            claims: 'Claim 1: A method for drone guidance using optical flow sensors.',
            ipc: 'B64C39/02',
            country: 'EP',
            owner: 'Aero Dynamics Inc',
            publicationDate: '2022-11-20',
        },
    ];
    const mockNoveltyAnalysis = {
        summary: 'The invention provides novel autonomous sensor fusion navigation.',
        similarPatents: [
            { patentId: 'US-9876543-B2', reason: 'Common LiDAR sensor usage' },
            { patentId: 'EP-1234567-A1', reason: 'Common optical flow guidance' },
        ],
        featureComparison: {
            commonFeatures: ['LiDAR range finding', 'Optical flow tracking'],
            uniqueFeatures: ['Real-time adaptive weight fusion'],
            partialOverlap: ['Altitude hold fallback'],
        },
        novelAspects: ['Adaptive dynamic weight algorithm for optical flow vs LiDAR'],
        overlappingClaims: ['US-9876543-B2 Claim 1 (High overlap)'],
        risks: ['Moderate infringement risk with US-9876543-B2'],
        recommendations: ['Narrow Claim 1 to feature real-time weight adjustment'],
    };
    beforeEach(() => {
        confidenceService = new ConfidenceService();
    });
    describe('Confidence Level Mapping', () => {
        it('should map score 90-100 to Very High', () => {
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(95)).toBe('Very High');
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(90)).toBe('Very High');
        });
        it('should map score 75-89 to High', () => {
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(88.5)).toBe('High');
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(75)).toBe('High');
        });
        it('should map score 60-74 to Medium', () => {
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(70)).toBe('Medium');
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(60)).toBe('Medium');
        });
        it('should map score 40-59 to Low', () => {
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(50)).toBe('Low');
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(40)).toBe('Low');
        });
        it('should map score 0-39 to Very Low', () => {
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(35)).toBe('Very Low');
            expect(ConfidenceCalculatorUtil.mapScoreToLevel(0)).toBe('Very Low');
        });
    });
    describe('Retrieval Confidence Calculation', () => {
        it('should calculate high retrieval confidence for strong search matches with complete metadata', () => {
            const result = confidenceService.calculateRetrievalConfidence(mockSearchResults, 2);
            expect(result.score).toBeGreaterThanOrEqual(75);
            expect(result.level).toMatch(/High|Very High/);
        });
        it('should handle empty search results gracefully', () => {
            const result = confidenceService.calculateRetrievalConfidence([], 10);
            expect(result.score).toBe(0);
            expect(result.level).toBe('Very Low');
        });
        it('should apply penalty for missing metadata fields', () => {
            const incompleteResults = [
                {
                    rank: 1,
                    score: 0.85,
                    patentId: 'US-001',
                    title: '',
                    abstract: '',
                    ipc: '',
                },
            ];
            const fullResult = confidenceService.calculateRetrievalConfidence(mockSearchResults, 2);
            const incompleteResult = confidenceService.calculateRetrievalConfidence(incompleteResults, 1);
            expect(incompleteResult.score).toBeLessThan(fullResult.score);
        });
    });
    describe('Novelty Analysis Confidence Calculation', () => {
        it('should calculate high analysis confidence for complete RAG reports backed by strong retrieval', () => {
            const retrievalConfidence = 90.0;
            const result = confidenceService.calculateAnalysisConfidence({
                retrievalConfidence,
                retrievedPatents: mockSearchResults,
                noveltyAnalysis: mockNoveltyAnalysis,
                overlappingClaimsCount: 1,
            });
            expect(result.score).toBeGreaterThanOrEqual(75);
            expect(result.level).toMatch(/High|Very High/);
        });
        it('should return low analysis confidence when retrieval confidence is low', () => {
            const lowRetrievalConfidence = 20.0;
            const result = confidenceService.calculateAnalysisConfidence({
                retrievalConfidence: lowRetrievalConfidence,
                retrievedPatents: mockSearchResults,
                noveltyAnalysis: mockNoveltyAnalysis,
            });
            expect(result.score).toBeLessThan(60);
            expect(result.level).toMatch(/Low|Very Low/);
        });
        it('should handle empty or null novelty analysis gracefully', () => {
            const result = confidenceService.calculateAnalysisConfidence({
                retrievalConfidence: 80,
                retrievedPatents: mockSearchResults,
                noveltyAnalysis: null,
            });
            expect(result.score).toBe(10);
            expect(result.level).toBe('Very Low');
        });
    });
    describe('Overall Confidence Combination', () => {
        it('should combine retrieval and analysis confidence into weighted overall score', () => {
            const retrievalScore = 90.0;
            const analysisScore = 80.0;
            const overall = confidenceService.calculateOverallConfidence(retrievalScore, analysisScore);
            // Default weights: 0.40 * 90 + 0.60 * 80 = 36 + 48 = 84
            expect(overall.score).toBeCloseTo(84.0, 1);
            expect(overall.level).toBe('High');
        });
    });
    describe('Full Confidence Computation', () => {
        it('should compute complete confidence breakdown payload', () => {
            const fullConfidence = confidenceService.computeFullConfidence(mockSearchResults, mockNoveltyAnalysis, 2);
            expect(fullConfidence.retrieval).toBeDefined();
            expect(fullConfidence.analysis).toBeDefined();
            expect(fullConfidence.overall).toBeDefined();
            expect(fullConfidence.retrieval.score).toBeGreaterThan(0);
            expect(fullConfidence.analysis.score).toBeGreaterThan(0);
            expect(fullConfidence.overall.score).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=confidence.service.spec.js.map