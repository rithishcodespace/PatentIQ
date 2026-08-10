import { z } from 'zod';
export declare const RegisterDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
export declare const LoginDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export interface AuthResponseDto {
    token?: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}
//# sourceMappingURL=auth.dto.d.ts.map