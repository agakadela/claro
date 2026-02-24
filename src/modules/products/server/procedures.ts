import { CustomCategory } from '@/app/(app)/types';
import { Category, Media, Tenant } from '@/payload-types';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { Sort, Where } from 'payload';
import { z } from 'zod';
import { sortValues } from '../hooks/use-products-filters';
import { DEFAULT_PRODUCTS_LIMIT } from '../constants';
import { TRPCError } from '@trpc/server';
import { headers as getHeaders } from 'next/headers';

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string(), tenantSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.payload.auth({ headers });

      let product = null;
      try {
        product = await ctx.payload.findByID({
          collection: 'products',
          id: input.id,
          depth: 2,
          select: {
            content: false,
          },
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

      let isPurchased = false;
      if (session.user) {
        const orderData = await ctx.payload.find({
          collection: 'orders',
          limit: 1,
          where: {
            user: {
              equals: session.user.id,
            },
            product: {
              equals: input.id,
            },
          },
        });
        isPurchased = !!orderData.docs[0];
      }

      const reviews = await ctx.payload.find({
        collection: 'reviews',
        where: {
          product: { equals: input.id },
        },
        pagination: false,
        select: {
          rating: true,
        },
      });

      const reviewRating =
        reviews.docs.length > 0
          ? reviews.docs.reduce((acc, review) => acc + review.rating, 0) /
            reviews.docs.length
          : 0;

      const ratingDistribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      if (reviews.docs.length > 0) {
        reviews.docs.forEach((review) => {
          if (review.rating >= 1 && review.rating <= 5) {
            ratingDistribution[review.rating] =
              (ratingDistribution[review.rating] || 0) + 1;
          }
        });

        Object.keys(ratingDistribution).forEach((star) => {
          const count = ratingDistribution[parseInt(star)] || 0;
          ratingDistribution[parseInt(star)] = Math.round(
            (count / reviews.docs.length) * 100,
          );
        });
      }

      return {
        ...product,
        isPurchased,
        reviewRating,
        reviewCount: reviews.totalDocs,
        ratingDistribution,
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
        select: {
          content: false,
        },
      });

      const productIds = products.docs.map((p) => p.id);

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

      const productsWithReviews = products.docs.map((product) => {
        const ratings = reviewsByProduct[product.id] ?? [];
        return {
          ...product,
          reviewCount: ratings.length,
          reviewRating:
            ratings.length > 0
              ? ratings.reduce((acc, r) => acc + r, 0) / ratings.length
              : 0,
        };
      });

      return {
        ...products,
        docs: productsWithReviews.map((product) => ({
          ...product,
          image: product.image as Media | null,
          tenant: product.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
