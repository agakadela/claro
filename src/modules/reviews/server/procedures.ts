import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

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

      if (existingReview.user !== ctx.session.user.id) {
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
});
