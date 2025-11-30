import { CustomCategory } from '@/app/(app)/types';
import { Category } from '@/payload-types';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { Where } from 'payload';
import { z } from 'zod';

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(z.object({ category: z.string().nullable().optional() }))
    .query(async ({ ctx, input }) => {
      const where: Where = {};

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
              })
            ),
          }));
        const subcategoriesSlugs = [];

        const parentCategory = formattedParentCategories[0];

        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map(
              (subcategory) => subcategory.slug
            )
          );
        }

        where['category.slug'] = {
          in: [parentCategory.slug, ...subcategoriesSlugs],
        };
      }

      const products = await ctx.payload.find({
        collection: 'products',
        depth: 1,
        where,
      });

      return products;
    }),
});
