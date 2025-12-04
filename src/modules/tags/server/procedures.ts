import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';
import { DEFAULT_TAGS_LIMIT } from '../constants';

export const tagsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_TAGS_LIMIT),
      })
    )
    .query(async ({ ctx, input }) => {
      const tags = await ctx.payload.find({
        collection: 'tags',
        page: input.cursor,
        limit: input.limit,
      });

      return tags;
    }),
});
