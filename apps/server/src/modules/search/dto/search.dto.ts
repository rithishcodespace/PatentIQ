import { z } from 'zod';

export const SearchQueryDtoSchema = z.object({
  query: z.string().min(1),
  topK: z.number().optional().default(100),
  ipcFilter: z.string().optional(),
});

export type SearchQueryDto = z.infer<typeof SearchQueryDtoSchema>;

export interface PriorArtMatchResult {
  patentId: string;
  patentNumber: string;
  title: string;
  abstract: string;
  similarityScore: number;
  ipcClassifications: string[];
}
