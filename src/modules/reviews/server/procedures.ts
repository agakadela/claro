import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/env';
import { reviewHelperPrompt } from '@/modules/reviews/prompts';
import { ReviewDraftSchema } from '@/modules/reviews/schemas';
import { lexicalToPlainText } from '@/lib/lexical';

export const reviewsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.payload.find({
        collection: 'reviews',
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: input.productId,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      return reviews.docs[0] ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        description: z
          .string()
          .min(1, {
            message:
              'Description is required and must be between 1 and 1000 characters',
          })
          .max(1000),
        rating: z
          .number()
          .int({ message: 'Rating must be a whole number' })
          .min(1, { message: 'Rating is required and must be between 1 and 5' })
          .max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let product = null;
      try {
        product = await ctx.payload.findByID({
          collection: 'products',
          id: input.productId,
          depth: 2,
        });
      } catch (error: unknown) {
        const isNotFound =
          error instanceof Error &&
          'status' in error &&
          (error as { status: number }).status === 404;
        if (!isNotFound) throw error;
      }

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      const order = await ctx.payload.find({
        collection: 'orders',
        limit: 1,
        where: {
          user: { equals: ctx.session.user.id },
          product: { equals: input.productId },
        },
      });

      if (!order.docs[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must purchase this product before reviewing it',
        });
      }

      const existingReview = await ctx.payload.find({
        collection: 'reviews',
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: input.productId,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      if (existingReview.totalDocs > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You have already reviewed this product',
        });
      }

      const review = await ctx.payload.create({
        collection: 'reviews',
        data: {
          product: input.productId,
          user: ctx.session.user.id,
          description: input.description,
          rating: input.rating,
        },
      });

      return review;
    }),

  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        description: z
          .string()
          .min(1, {
            message:
              'Description is required and must be between 1 and 1000 characters',
          })
          .max(1000),
        rating: z
          .number()
          .int({ message: 'Rating must be a whole number' })
          .min(1, { message: 'Rating is required and must be between 1 and 5' })
          .max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let existingReview = null;
      try {
        existingReview = await ctx.payload.findByID({
          collection: 'reviews',
          id: input.reviewId,
          depth: 0,
        });
      } catch (error: unknown) {
        const isNotFound =
          error instanceof Error &&
          'status' in error &&
          (error as { status: number }).status === 404;
        if (!isNotFound) throw error;
      }

      if (!existingReview) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
      }

      if (String(existingReview.user) !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not allowed to update this review',
        });
      }

      const updatedReview = await ctx.payload.update({
        collection: 'reviews',
        id: input.reviewId,
        data: {
          description: input.description,
          rating: input.rating,
        },
      });

      return updatedReview;
    }),

  generateReviewDraft: protectedProcedure
    .input(z.object({ productId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (env.NEXT_PUBLIC_FEATURE_AI_REVIEW_HELPER !== 'true') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'AI review helper is not enabled',
        });
      }

      if (!env.ANTHROPIC_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI review helper is not configured',
        });
      }

      // TODO: replace with Upstash Redis for distributed rate limiting across serverless instances

      const order = await ctx.payload.find({
        collection: 'orders',
        limit: 1,
        where: {
          user: { equals: ctx.session.user.id },
          product: { equals: input.productId },
        },
      });

      if (!order.docs[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must purchase this product before using AI review helper',
        });
      }

      let product = null;
      try {
        product = await ctx.payload.findByID({
          collection: 'products',
          id: input.productId,
          depth: 0,
        });
      } catch (error: unknown) {
        const isNotFound =
          error instanceof Error &&
          'status' in error &&
          (error as { status: number }).status === 404;
        if (!isNotFound) throw error;
      }

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      const productDescription = lexicalToPlainText(product.description);

      const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

      const response = await anthropic.messages
        .create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          tools: [
            {
              name: 'submit_review_draft',
              description: 'Submit a review draft with a rating and description',
              input_schema: {
                type: 'object' as const,
                properties: {
                  rating: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 5,
                    description: 'Star rating from 1 to 5',
                  },
                  description: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 1000,
                    description: 'Review text, 2-4 sentences',
                  },
                },
                required: ['rating', 'description'],
              },
            },
          ],
          tool_choice: { type: 'tool', name: 'submit_review_draft' },
          messages: [
            {
              role: 'user',
              content: reviewHelperPrompt(product.name, productDescription),
            },
          ],
        })
        .catch((error: unknown) => {
          console.error('[generateReviewDraft] Anthropic API call failed', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate review draft',
          });
        });

      const toolUse = response.content.find((block) => block.type === 'tool_use');
      if (!toolUse || toolUse.type !== 'tool_use') {
        console.error('[generateReviewDraft] No tool_use block in response', response.content);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate review draft',
        });
      }

      const draft = ReviewDraftSchema.safeParse(toolUse.input);
      if (!draft.success) {
        console.error('[generateReviewDraft] Zod parse failed', draft.error, toolUse.input);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate review draft',
        });
      }

      return draft.data;
    }),
});
