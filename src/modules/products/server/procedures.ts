import { CustomCategory } from '@/app/(app)/types';
import { Category, Media, Tenant } from '@/payload-types';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { Sort, Where } from 'payload';
import { z } from 'zod';
import { sortValues } from '../hooks/use-products-filters';
import { DEFAULT_PRODUCTS_LIMIT } from '../constants';
import { TRPCError } from '@trpc/server';

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string(), tenantSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.payload.findByID({
        collection: 'products',
        id: input.id,
        depth: 2,
      });

      const tenant =
        product.tenant && typeof product.tenant === 'object'
          ? (product.tenant as Tenant)
          : null;
      if (!tenant || tenant.slug !== input.tenantSlug) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      return {
        ...product,
        image: product.image as Media | null,
        tenant: { ...tenant, image: tenant.image as Media | null },
      };
    }),
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_PRODUCTS_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.number().nullable().optional(),
        maxPrice: z.number().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      let sort: Sort = '-createdAt';

      if (input.sort === 'trending') {
        sort = '-createdAt';
      }
      if (input.sort === 'newest') {
        sort = '-createdAt';
      }
      if (input.sort === 'for_you') {
        sort = '-createdAt';
      }

      if (input.minPrice) {
        where.price = {
          ...where.price,
          greater_than_equal: input.minPrice,
        };
      }
      if (input.maxPrice) {
        where.price = {
          ...where.price,
          less_than_equal: input.maxPrice,
        };
      }

      if (input.tenantSlug) {
        where['tenant.slug'] = {
          equals: input.tenantSlug,
        };
      }

      if (input.tags && input.tags.length > 0) {
        where['tags.name'] = {
          in: input.tags,
        };
      }

      if (input.category) {
        const categoriesData = await ctx.payload.find({
          collection: 'categories',
          depth: 1,
          limit: 1,
          where: {
            slug: {
              equals: input.category,
            },
          },
        });

        const formattedParentCategories: CustomCategory[] =
          categoriesData.docs.map((category) => ({
            ...category,
            subcategories: (category.subcategories?.docs ?? []).map(
              (subcategory) => ({
                ...(subcategory as Category), // we know it's Category not string because of depth: 1
                subcategories: undefined,
              }),
            ),
          }));
        const subcategoriesSlugs = [];

        const parentCategory = formattedParentCategories[0];

        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map(
              (subcategory) => subcategory.slug,
            ),
          );
          where['category.slug'] = {
            in: [parentCategory.slug, ...subcategoriesSlugs],
          };
        }
      }

      const products = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
      });

      return {
        ...products,
        docs: products.docs.map((product) => ({
          ...product,
          image: product.image as Media | null,
          tenant: product.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
