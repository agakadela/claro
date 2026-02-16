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

export const checkoutRouter = createTRPCRouter({
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

      if (!tenant.stripeConnectAccountId) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Tenant has not configured payment processing',
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

      const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: ctx.session.user.email,
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}${generateTenantUrl(input.tenantSlug)}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${generateTenantUrl(input.tenantSlug)}/checkout/cancel`,
        invoice_creation: {
          enabled: true,
        },
        metadata: {
          userId: ctx.session.user.id,
        } as CheckoutSessionMetadata,
      });

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
