import { z } from 'zod';

export const ReviewDraftSchema = z.object({
  rating: z.number().int().min(1).max(5),
  description: z.string().min(1).max(1000),
});

export type ReviewDraft = z.infer<typeof ReviewDraftSchema>;
