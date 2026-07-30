import { z } from 'zod';

export const UserProfileDtoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
  createdAt: z.date().optional(),
});

export type UserProfileDto = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: Date | undefined;
};

export const UpdateUserProfileDtoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export type UpdateUserProfileDto = {
  name?: string | undefined;
  email?: string | undefined;
};
