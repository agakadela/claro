import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { Category } from '@/payload-types';
import { CustomCategory } from '@/app/(app)/types';

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const categories = await ctx.payload.find({
      collection: 'categories',
      depth: 1,
      pagination: false,
      where: {
        parent: {
          exists: false,
        },
      },
      sort: 'name',
    });

    const formattedCategories: CustomCategory[] = categories.docs.map(
      (category) => ({
        ...category,
        subcategories: (category.subcategories?.docs ?? []).map(
          (subcategory) => ({
            ...(subcategory as Category), // we know it's Category not string because of depth: 1
          })
        ),
      })
    );
    return formattedCategories;
  }),
});
