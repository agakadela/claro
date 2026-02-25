import { Media, Product, Tenant } from '@/payload-types';
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { CheckoutSessionMetadata, ProductMetadata } from '../types';
import { stripe } from '@/lib/stripe';
import { generateTenantUrl } from '@/lib/utils';
import { PLATFORM_FEE_PERCENTAGE } from '../constants';

export const checkoutRouter = createTRPCRouter({
  verify: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.payload.findByID({
      collection: 'users',
      id: ctx.session.user.id,
      depth: 0,
    });

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }

    const tenantId = user.tenants?.[0]?.tenant as string | undefined;

    if (!tenantId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No tenant found for this user',
      });
    }

    const tenant = await ctx.payload.findByID({
      collection: 'tenants',
      id: tenantId,
    });

    if (!tenant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tenant not found',
      });
    }

    const account = await stripe.accountLinks.create({
      type: 'account_onboarding',
      account: tenant.stripeConnectAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL!}/`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL!}/`,
    });

    if (!account.url) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Failed to create Stripe account link',
      });
    }

    return {
      url: account.url,
    };
  }),
  purchase: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1),
        tenantSlug: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const productsData = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        limit: input.productIds.length,
        where: {
          and: [
            {
              id: {
                in: input.productIds,
              },
            },
            {
              'tenant.slug': {
                equals: input.tenantSlug,
              },
            },
          ],
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

      const existingOrders = await ctx.payload.find({
        collection: 'orders',
        depth: 0,
        limit: input.productIds.length,
        where: {
          user: { equals: ctx.session.user.id },
          product: { in: input.productIds },
        },
      });

      if (existingOrders.totalDocs > 0) {
        const alreadyOwnedIds = existingOrders.docs.map((o) =>
          typeof o.product === 'object' && o.product !== null
            ? (o.product as { id: string }).id
            : (o.product as string),
        );
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You already own some of these products',
          cause: { invalidIds: alreadyOwnedIds },
        });
      }

      const tenantsData = await ctx.payload.find({
        collection: 'tenants',
        depth: 1,
        limit: 1,
        where: {
          slug: {
            equals: input.tenantSlug,
          },
        },
        pagination: false,
      });

      const tenant = tenantsData.docs[0] as Tenant;

      if (!tenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tenant not found',
        });
      }

      if (!tenant.stripeConnectAccountId || !tenant.stripeDetailsSubmitted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tenant has not submitted Stripe details',
        });
      }

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        productsData.docs.map((product: Product) => ({
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              metadata: {
                stripeAccountId: tenant.stripeConnectAccountId,
                id: product.id,
                name: product.name,
                price: product.price,
              } as ProductMetadata,
            },
            unit_amount: Math.round(product.price * 100),
          },
        }));

      const totalAmount = productsData.docs.reduce(
        (acc, item) => acc + item.price * 100,
        0,
      );

      const platformFeeAmount = Math.round(
        totalAmount * (PLATFORM_FEE_PERCENTAGE / 100),
      );

      const checkoutSession = await stripe.checkout.sessions.create(
        {
          customer_email: ctx.session.user.email,
          line_items: lineItems,
          mode: 'payment',
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}${generateTenantUrl(input.tenantSlug)}/checkout?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${generateTenantUrl(input.tenantSlug)}/checkout?cancel=true`,
          invoice_creation: {
            enabled: true,
          },
          metadata: {
            userId: ctx.session.user.id,
          } as CheckoutSessionMetadata,
          payment_intent_data: {
            application_fee_amount: platformFeeAmount,
          },
        },
        {
          stripeAccount: tenant.stripeConnectAccountId,
        },
      );

      if (!checkoutSession.url) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        });
      }

      return {
        url: checkoutSession.url,
      };
    }),

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
        limit: input.productIds.length,
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
