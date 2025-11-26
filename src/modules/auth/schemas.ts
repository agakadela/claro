import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(63, { message: 'Username must be less than 64 characters long' })
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
      message:
        'Username can only contain lowercase letters, numbers, and hyphens. It must start and end with a letter or number.',
    })
    .refine((username) => !username.includes('--'), {
      message: 'Username cannot contain consecutive hyphens',
    })
    .transform((username) => username.toLowerCase()),
  password: z.string(),
  email: z.email(),
});

export const loginSchema = z.object({
  password: z.string(),
  email: z.email(),
});
