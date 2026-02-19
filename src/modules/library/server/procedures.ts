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
      const orders = await ctx.payload.find({
        collection: 'orders',
        depth: 0,
        sort: '-createdAt',
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
        page: input.cursor,
        limit: input.limit,
      });

      const productsIds = [
        ...new Set(orders.docs.map((order) => order.product)),
      ];
      const productsData = await ctx.payload.find({
        collection: 'products',
        pagination: false,
        depth: 2,
        where: {
          id: {
            in: productsIds,
          },
        },
      });

      return {
        ...productsData,
        totalDocs: orders.totalDocs,
        totalPages: orders.totalPages,
        page: orders.page,
        nextPage: orders.nextPage,
        hasNextPage: orders.hasNextPage,
        docs: productsData.docs.map((product) => ({
          ...product,
          image: product.image as Media | null,
          tenant: product.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
