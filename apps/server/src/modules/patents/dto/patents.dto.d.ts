import { z } from 'zod';
export declare const CreatePatentDtoSchema: z.ZodObject<{
    patentNumber: z.ZodString;
    title: z.ZodString;
    abstract: z.ZodString;
    claims: z.ZodArray<z.ZodString>;
    ipcClassifications: z.ZodDefault<z.ZodArray<z.ZodString>>;
    assignee: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreatePatentDto = z.infer<typeof CreatePatentDtoSchema>;
export declare const PatentQueryFilterDtoSchema: z.ZodObject<{
    ipc: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type PatentQueryFilterDto = z.infer<typeof PatentQueryFilterDtoSchema>;
//# sourceMappingURL=patents.dto.d.ts.map