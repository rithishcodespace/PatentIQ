import { z } from 'zod';
export declare const ConfidenceLevelSchema: z.ZodEnum<{
    High: "High";
    Low: "Low";
    Medium: "Medium";
    "Very High": "Very High";
    "Very Low": "Very Low";
}>;
export declare const ConfidenceScoreItemDtoSchema: z.ZodObject<{
    score: z.ZodNumber;
    level: z.ZodEnum<{
        High: "High";
        Low: "Low";
        Medium: "Medium";
        "Very High": "Very High";
        "Very Low": "Very Low";
    }>;
}, z.core.$strip>;
export type ConfidenceScoreItemDto = z.infer<typeof ConfidenceScoreItemDtoSchema>;
export declare const FullConfidenceDtoSchema: z.ZodObject<{
    retrieval: z.ZodObject<{
        score: z.ZodNumber;
        level: z.ZodEnum<{
            High: "High";
            Low: "Low";
            Medium: "Medium";
            "Very High": "Very High";
            "Very Low": "Very Low";
        }>;
    }, z.core.$strip>;
    analysis: z.ZodObject<{
        score: z.ZodNumber;
        level: z.ZodEnum<{
            High: "High";
            Low: "Low";
            Medium: "Medium";
            "Very High": "Very High";
            "Very Low": "Very Low";
        }>;
    }, z.core.$strip>;
    overall: z.ZodObject<{
        score: z.ZodNumber;
        level: z.ZodEnum<{
            High: "High";
            Low: "Low";
            Medium: "Medium";
            "Very High": "Very High";
            "Very Low": "Very Low";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type FullConfidenceDto = z.infer<typeof FullConfidenceDtoSchema>;
//# sourceMappingURL=confidence.dto.d.ts.map