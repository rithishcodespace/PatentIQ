import { z } from 'zod';

export const CreatePatentDtoSchema = z.object({
  patentNumber: z.string().min(1),
  title: z.string().min(1),
  abstract: z.string(),
  claims: z.array(z.string()),
  ipcClassifications: z.array(z.string()).default([]),
  assignee: z.string().optional(),
});

export type CreatePatentDto = z.infer<typeof CreatePatentDtoSchema>;

export const PatentQueryFilterDtoSchema = z.object({
  ipc: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
});

export type PatentQueryFilterDto = z.infer<typeof PatentQueryFilterDtoSchema>;
