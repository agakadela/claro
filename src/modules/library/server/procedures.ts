import { Media, Tenant } from '@/payload-types';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import { DEFAULT_PRODUCTS_LIMIT } from '@/modules/products/constants';

export const libraryRouter = createTRPCRouter({
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
        sort: '-createdAt',
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
      });

      const allProductIds = [
        ...new Set(allOrders.docs.map((order) => order.product as string)),
      ];

      const productsData = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        where: {
          id: {
            in: allProductIds,
          },
        },
        page: input.cursor,
        limit: input.limit,
      });

      return {
        ...productsData,
        docs: productsData.docs.map((product) => ({
          ...product,
          image: product.image as Media | null,
          tenant: product.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
