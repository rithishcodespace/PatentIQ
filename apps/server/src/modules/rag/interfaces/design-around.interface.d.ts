export type RandDFeasibility = 'HIGH' | 'MEDIUM' | 'LOW';
export interface DesignAroundRecommendation {
    featureId: string;
    featureName: string;
    conflictReason: string;
    suggestedModification: string;
    patentabilityBoost: string;
    rAndDFeasibility: RandDFeasibility;
    targetPriorArtId?: string | undefined;
}
export interface DesignAroundResult {
    overallStrategy: string;
    totalRecommendationsCount: number;
    recommendations: DesignAroundRecommendation[];
    metrics?: {
        executionTimeMs: number;
        evaluatedFeaturesCount: number;
    } | undefined;
}
export interface DesignAroundRequestInput {
    query?: string | undefined;
    text?: string | undefined;
    features?: Array<{
        id: string;
        name: string;
        description: string;
    }> | undefined;
    topK?: number | undefined;
}
//# sourceMappingURL=design-around.interface.d.ts.map