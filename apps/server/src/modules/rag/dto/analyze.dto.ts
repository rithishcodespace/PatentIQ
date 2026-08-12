import { z } from 'zod';

export const AnalyzeRequestSchema = z
  .object({
    invention: z.string().optional(),
    inventionDisclosure: z.string().optional(),
    query: z.string().optional(),
    patentId: z.string({
      message: 'patentId is required',
    }).min(1, 'patentId cannot be empty'),
    selectedPatentId: z.string().optional(),
    sessionId: z.string().optional(),
  })
  .refine(
    (data) => Boolean((data.invention && data.invention.trim()) || (data.inventionDisclosure && data.inventionDisclosure.trim()) || (data.query && data.query.trim())),
    {
      message: 'Invention disclosure text is required (pass invention, inventionDisclosure, or query)',
      path: ['invention'],
    }
  );

export type AnalyzeRequestDto = {
  invention?: string | undefined;
  inventionDisclosure?: string | undefined;
  query?: string | undefined;
  patentId: string;
  selectedPatentId?: string | undefined;
  sessionId?: string | undefined;
};

export type PatentSectionType = 'Claim' | 'Abstract' | 'Description';

export interface EvidenceDetail {
  text: string;
  section: PatentSectionType;
  claimNumber?: number | undefined;
  sourceUrl: string;
}

export type FeatureMatchStatus = 'MATCH' | 'PARTIAL_MATCH' | 'NOT_FOUND';

export interface FeatureEvidenceAnalysisItem {
  id: string;
  text: string;
  status: FeatureMatchStatus;
  matchStrength: number;
  evidence: EvidenceDetail | null;
}

export interface AnalyzePatentResponseDto {
  success: boolean;
  patent: {
    id: string;
    patentNumber?: string | undefined;
    title: string;
    sourceUrl: string;
  };
  features: FeatureEvidenceAnalysisItem[];
  sessionId?: string | undefined;
}
