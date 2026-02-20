import { Media, Tenant } from '@/payload-types';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import { DEFAULT_PRODUCTS_LIMIT } from '@/modules/products/constants';
import { TRPCError } from '@trpc/server';

export const libraryRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const orderData = await ctx.payload.find({
        collection: 'orders',
        limit: 1,

        where: {
          user: {
            equals: ctx.session.user.id,
          },
          product: {
            equals: input.productId,
          },
        },
      });

      const order = orderData.docs[0];

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

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

      return {
        ...product,
        image: product.image as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_PRODUCTS_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allOrders = await ctx.payload.find({
        collection: 'orders',
        depth: 0,
        pagination: false,
        where: { user: { equals: ctx.session.user.id } },
        select: { product: true },
      });

      const allProductIds = [
        ...new Set(allOrders.docs.map((order) => order.product as string)),
      ];

      if (allProductIds.length === 0) {
        return {
          docs: [],
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
          page: input.cursor,
          limit: input.limit,
          totalDocs: 0,
          totalPages: 0,
          pagingCounter: 1,
        };
      }

      const productsData = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        where: { id: { in: allProductIds } },
        page: input.cursor,
        limit: input.limit,
      });

      const productIds = productsData.docs.map((p) => p.id);

      const allReviews =
        productIds.length > 0
          ? await ctx.payload.find({
              collection: 'reviews',
              pagination: false,
              where: { product: { in: productIds } },
              select: { rating: true, product: true },
            })
          : { docs: [] };

      const reviewsByProduct = allReviews.docs.reduce<Record<string, number[]>>(
        (acc, review) => {
          const id =
            typeof review.product === 'string'
              ? review.product
              : review.product.id;
          if (!acc[id]) acc[id] = [];
          acc[id].push(review.rating);
          return acc;
        },
        {},
      );

      return {
        ...productsData,
        docs: productsData.docs.map((product) => {
          const ratings = reviewsByProduct[product.id] ?? [];
          return {
            ...product,
            reviewCount: ratings.length,
            reviewRating:
              ratings.length > 0
                ? ratings.reduce((acc, r) => acc + r, 0) / ratings.length
                : 0,
            image: product.image as Media | null,
            tenant: product.tenant as Tenant & { image: Media | null },
          };
        }),
      };
    }),
});
