import { z } from 'zod';
export const RegisterDtoSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
});
export const LoginDtoSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
//# sourceMappingURL=auth.dto.js.map