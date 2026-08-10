import { z } from 'zod';
export const UserProfileDtoSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
    createdAt: z.date().optional(),
});
export const UpdateUserProfileDtoSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
});
//# sourceMappingURL=users.dto.js.map