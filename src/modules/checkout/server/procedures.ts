import { Media, Product, Tenant } from '@/payload-types';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const checkoutRouter = createTRPCRouter({
  getProducts: baseProcedure
    .input(
      z.object({
        productIds: z.array(z.string()),
        tenantSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const productsData = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        where: {
          id: {
            in: input.productIds,
          },
        },
      });

      const returnedIds = productsData.docs.map((p: Product) => p.id);
      const missingIds = input.productIds.filter(
        (id) => !returnedIds.includes(id),
      );

      if (missingIds.length > 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Some products not found',
          cause: { missingIds },
        });
      }

      const invalidProducts = productsData.docs.filter((p: Product) => {
        if (typeof p.tenant === 'object' && p.tenant !== null) {
          return p.tenant.slug !== input.tenantSlug;
        }
        return false;
      });

      if (invalidProducts.length > 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Products do not belong to this tenant',
          cause: { invalidIds: invalidProducts.map((p: Product) => p.id) },
        });
      }

      return {
        ...productsData,
        docs: productsData.docs.map((product: Product) => ({
          ...product,
          image: product.image as Media | null,
          tenant: product.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
