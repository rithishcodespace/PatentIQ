export type FeatureOverlapStatus = 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'NO_MATCH';
export type NoveltyRiskLevel = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK';
export interface ExtractedFeatureInput {
    id: string;
    name: string;
    description: string;
    category?: string | undefined;
    importance?: 'CRITICAL' | 'IMPORTANT' | 'SECONDARY' | string | undefined;
}
export interface FeatureOverlapItem {
    featureId: string;
    featureName: string;
    featureDescription: string;
    status: FeatureOverlapStatus;
    matchConfidence: number;
    citationEvidence: string;
    explanation: string;
}
export interface PatentNoveltyMatrix {
    patentId: string;
    title: string;
    ipc: string;
    similarityScore: number;
    overallPatentOverlapScore: number;
    featureOverlaps: FeatureOverlapItem[];
}
export interface NoveltyMatrixResult {
    overallRiskLevel: NoveltyRiskLevel;
    noveltyRiskScore: number;
    executiveRationale: string;
    matrix: PatentNoveltyMatrix[];
    metrics?: {
        executionTimeMs: number;
        evaluatedFeaturesCount: number;
        evaluatedPatentsCount: number;
    } | undefined;
}
export interface NoveltyMatrixRequestInput {
    query?: string | undefined;
    text?: string | undefined;
    features?: ExtractedFeatureInput[] | undefined;
    topK?: number | undefined;
}
//# sourceMappingURL=novelty-matrix.interface.d.ts.map