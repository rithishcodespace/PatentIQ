import { z } from 'zod';
import type { RagAnalysisRequest, RagAnalysisResponse, NoveltyAnalysisResult, RagRetrievedPatent, SimilarPatentItem, FeatureComparison, RelevantSection, OverlappingClaim, OverlapAnalysisItem } from '../interfaces/rag.interface.js';
/**
 * Zod validation schema for POST /api/rag/analyze request payload.
 */
export declare const RagAnalysisRequestDtoSchema: z.ZodObject<{
    query: z.ZodString;
    topK: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type RagAnalysisRequestDto = z.infer<typeof RagAnalysisRequestDtoSchema>;
/**
 * Zod validation schema for POST /api/rag/deconstruct request payload.
 */
export declare const FeatureDeconstructionDtoSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type FeatureDeconstructionDto = z.infer<typeof FeatureDeconstructionDtoSchema>;
/**
 * Zod schema for individual retrieved patent item returned in RAG response.
 */
export declare const RagRetrievedPatentDtoSchema: z.ZodObject<{
    patentId: z.ZodString;
    title: z.ZodString;
    score: z.ZodNumber;
    ipc: z.ZodOptional<z.ZodString>;
    abstract: z.ZodOptional<z.ZodString>;
    section: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RagRetrievedPatentDto = z.infer<typeof RagRetrievedPatentDtoSchema>;
/**
 * Zod schema for similar patent item in novelty report.
 */
export declare const SimilarPatentItemDtoSchema: z.ZodObject<{
    patentId: z.ZodString;
    reason: z.ZodString;
}, z.core.$strip>;
export type SimilarPatentItemDto = z.infer<typeof SimilarPatentItemDtoSchema>;
/**
 * Zod schema for feature comparison section.
 */
export declare const FeatureComparisonDtoSchema: z.ZodObject<{
    commonFeatures: z.ZodArray<z.ZodString>;
    uniqueFeatures: z.ZodArray<z.ZodString>;
    partialOverlap: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type FeatureComparisonDto = z.infer<typeof FeatureComparisonDtoSchema>;
/**
 * Zod schema for 7-section AI novelty analysis result.
 */
export declare const NoveltyAnalysisResultDtoSchema: z.ZodObject<{
    summary: z.ZodString;
    similarPatents: z.ZodArray<z.ZodObject<{
        patentId: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strip>>;
    featureComparison: z.ZodObject<{
        commonFeatures: z.ZodArray<z.ZodString>;
        uniqueFeatures: z.ZodArray<z.ZodString>;
        partialOverlap: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    novelAspects: z.ZodArray<z.ZodString>;
    overlappingClaims: z.ZodArray<z.ZodString>;
    risks: z.ZodArray<z.ZodString>;
    recommendations: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type NoveltyAnalysisResultDto = z.infer<typeof NoveltyAnalysisResultDtoSchema>;
/**
 * Zod schema for relevant section item.
 */
export declare const RelevantSectionDtoSchema: z.ZodObject<{
    section: z.ZodString;
    reason: z.ZodString;
}, z.core.$strip>;
export type RelevantSectionDto = z.infer<typeof RelevantSectionDtoSchema>;
/**
 * Zod schema for overlapping claim item.
 */
export declare const OverlappingClaimDtoSchema: z.ZodObject<{
    claimNumber: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    summary: z.ZodString;
    reason: z.ZodString;
    overlapStrength: z.ZodEnum<{
        High: "High";
        Low: "Low";
        Medium: "Medium";
    }>;
}, z.core.$strip>;
export type OverlappingClaimDto = z.infer<typeof OverlappingClaimDtoSchema>;
/**
 * Zod schema for overlap analysis item per retrieved patent.
 */
export declare const OverlapAnalysisItemDtoSchema: z.ZodObject<{
    patentId: z.ZodString;
    title: z.ZodString;
    similarityScore: z.ZodNumber;
    relevantSections: z.ZodArray<z.ZodObject<{
        section: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strip>>;
    overlappingClaims: z.ZodArray<z.ZodObject<{
        claimNumber: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
        summary: z.ZodString;
        reason: z.ZodString;
        overlapStrength: z.ZodEnum<{
            High: "High";
            Low: "Low";
            Medium: "Medium";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type OverlapAnalysisItemDto = z.infer<typeof OverlapAnalysisItemDtoSchema>;
export declare const RagConfidenceBlockDtoSchema: z.ZodObject<{
    retrieval: z.ZodObject<{
        score: z.ZodNumber;
        level: z.ZodString;
    }, z.core.$strip>;
    analysis: z.ZodObject<{
        score: z.ZodNumber;
        level: z.ZodString;
    }, z.core.$strip>;
    overall: z.ZodObject<{
        score: z.ZodNumber;
        level: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const RagAnalysisResponseDtoSchema: z.ZodObject<{
    success: z.ZodBoolean;
    query: z.ZodString;
    confidence: z.ZodOptional<z.ZodObject<{
        retrieval: z.ZodObject<{
            score: z.ZodNumber;
            level: z.ZodString;
        }, z.core.$strip>;
        analysis: z.ZodObject<{
            score: z.ZodNumber;
            level: z.ZodString;
        }, z.core.$strip>;
        overall: z.ZodObject<{
            score: z.ZodNumber;
            level: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    retrievedPatents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        patentId: z.ZodString;
        title: z.ZodString;
        score: z.ZodNumber;
        ipc: z.ZodOptional<z.ZodString>;
        abstract: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    analysis: z.ZodObject<{
        summary: z.ZodString;
        similarPatents: z.ZodArray<z.ZodObject<{
            patentId: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strip>>;
        featureComparison: z.ZodObject<{
            commonFeatures: z.ZodArray<z.ZodString>;
            uniqueFeatures: z.ZodArray<z.ZodString>;
            partialOverlap: z.ZodArray<z.ZodString>;
        }, z.core.$strip>;
        novelAspects: z.ZodArray<z.ZodString>;
        overlappingClaims: z.ZodArray<z.ZodString>;
        risks: z.ZodArray<z.ZodString>;
        recommendations: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    overlapAnalysis: z.ZodOptional<z.ZodArray<z.ZodObject<{
        patentId: z.ZodString;
        title: z.ZodString;
        similarityScore: z.ZodNumber;
        relevantSections: z.ZodArray<z.ZodObject<{
            section: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strip>>;
        overlappingClaims: z.ZodArray<z.ZodObject<{
            claimNumber: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            summary: z.ZodString;
            reason: z.ZodString;
            overlapStrength: z.ZodEnum<{
                High: "High";
                Low: "Low";
                Medium: "Medium";
            }>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type RagAnalysisResponseDto = z.infer<typeof RagAnalysisResponseDtoSchema>;
export type { RagAnalysisRequest, RagAnalysisResponse, NoveltyAnalysisResult, RagRetrievedPatent, SimilarPatentItem, FeatureComparison, RelevantSection, OverlappingClaim, OverlapAnalysisItem, };
/**
 * Legacy hybrid ranking DTO schema for backward compatibility.
 */
export declare const HybridRankingDtoSchema: z.ZodObject<{
    queryText: z.ZodString;
    topRawResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    topRerankedResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    weights: z.ZodOptional<z.ZodObject<{
        semantic: z.ZodDefault<z.ZodNumber>;
        bm25: z.ZodDefault<z.ZodNumber>;
        claimSimilarity: z.ZodDefault<z.ZodNumber>;
        ipcMatch: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type HybridRankingDto = z.infer<typeof HybridRankingDtoSchema>;
export interface RankedPatentCandidate {
    patentId: string;
    combinedScore: number;
    semanticScore: number;
    bm25Score: number;
    claimScore: number;
    ipcScore: number;
}
/**
 * Zod schema for POST /api/rag/design-around request payload.
 */
export declare const DesignAroundRequestDtoSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    topK: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    features: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        name: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type DesignAroundRequestDto = z.infer<typeof DesignAroundRequestDtoSchema>;
//# sourceMappingURL=rag.dto.d.ts.map