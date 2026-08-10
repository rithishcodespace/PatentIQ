import { z } from 'zod';
export declare const UserProfileDtoSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export type UserProfileDto = {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt?: Date | undefined;
};
export declare const UpdateUserProfileDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateUserProfileDto = {
    name?: string | undefined;
    email?: string | undefined;
};
//# sourceMappingURL=users.dto.d.ts.map