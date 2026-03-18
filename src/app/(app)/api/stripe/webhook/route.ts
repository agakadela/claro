import type { Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { getPayloadCached } from '@/lib/payload';

import { env } from '@/env';
import { stripe } from '@/lib/stripe';
import { ExpandedLineItem } from '@/modules/checkout/types';

export async function POST(request: Request) {
  let event: Stripe.Event;

  try {
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { message: 'Missing stripe-signature header' },
        { status: 400 },
      );
    }

    event = stripe.webhooks.constructEvent(
      await (await request.blob()).text(),
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof Error) {
      console.log(error);
    }

    console.log(`Stripe webhook error: ${errorMessage}`);
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
  console.log(`✅ Stripe webhook received: ${event.type}`);

  const permittedEvents: Stripe.Event.Type[] = [
    'checkout.session.completed',
    'account.updated',
  ];

  const payloadEvent = await getPayloadCached();
  if (permittedEvents.includes(event.type)) {
    let data: Stripe.Checkout.Session;

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          data = event.data.object;

          if (!data.metadata?.userId) {
            throw new Error('User ID is required');
          }

          const user = await payloadEvent.findByID({
            collection: 'users',
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error('User not found');
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ['line_items.data.price.product'],
            },
            {
              stripeAccount: event.account,
            },
          );

          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error('No line items found');
          }

          const lineItems = expandedSession.line_items
            .data as ExpandedLineItem[];

          for (const lineItem of lineItems) {
            try {
              await payloadEvent.create({
                collection: 'orders',
                data: {
                  user: user.id,
                  product: lineItem.price.product.metadata.id,
                  stripeCheckoutSessionId: `${data.id}-${lineItem.id}`,
                  stripeAccountId: event.account,
                  name: lineItem.price.product.name,
                },
              });
            } catch (error) {
              // Skip if order already exists (duplicate webhook)
              if (
                error instanceof Error &&
                error.message.includes('duplicate')
              ) {
                console.log(
                  `Order already exists for session ${data.id}, line item ${lineItem.id}`,
                );
                continue;
              }
              throw error;
            }
          }

          break;
        }
        case 'account.updated': {
          const data = event.data.object as Stripe.Account;

          await payloadEvent.update({
            collection: 'tenants',
            where: {
              stripeConnectAccountId: {
                equals: data.id,
              },
            },
            data: {
              stripeDetailsSubmitted: data.details_submitted,
            },
          });

          break;
        }
        default:
          throw new Error(`Unsupported event type: ${event.type}`);
      }
    } catch (error) {
      console.log(
        `Stripe webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return NextResponse.json(
        { message: 'Webhook processing failed' },
        { status: 500 },
      );
    }
  }
  return NextResponse.json(
    { message: 'Webhook processed successfully' },
    { status: 200 },
  );
}
