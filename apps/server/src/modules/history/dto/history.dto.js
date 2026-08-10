import { z } from 'zod';
/**
 * Zod Schema for History Filtering, Sorting, and Pagination Query Parameters
 */
export const HistoryQueryFilterDtoSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(['createdAt', 'searchQuery', 'totalResults', 'searchLatency']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    query: z.string().trim().optional(),
    ipc: z.string().trim().optional(),
    minScore: z.coerce.number().min(0).max(1).optional(),
    maxScore: z.coerce.number().min(0).max(1).optional(),
    userId: z.string().trim().optional(),
});
/**
 * Zod Schema for History Record ID Parameter
 */
export const HistoryParamIdDtoSchema = z.object({
    id: z.string().min(1, 'History ID is required'),
});
//# sourceMappingURL=history.dto.js.map