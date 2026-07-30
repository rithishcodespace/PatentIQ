import { z } from 'zod';

export const HybridRankingDtoSchema = z.object({
  queryText: z.string().min(1),
  topRawResults: z.number().optional().default(100),
  topRerankedResults: z.number().optional().default(20),
  weights: z
    .object({
      semantic: z.number().default(0.4),
      bm25: z.number().default(0.3),
      claimSimilarity: z.number().default(0.2),
      ipcMatch: z.number().default(0.1),
    })
    .optional(),
});

export type HybridRankingDto = z.infer<typeof HybridRankingDtoSchema>;

export interface RankedPatentCandidate {
  patentId: string;
  combinedScore: number;
  semanticScore: number;
  bm25Score: number;
  claimScore: number;
  ipcScore: number;
}
