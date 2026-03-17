import { isSuperAdmin } from '@/lib/access';
import { CollectionConfig } from 'payload';
import type { Payload } from 'payload';

const syncOrderCount = async (productId: string, payload: Payload) => {
  const { totalDocs } = await payload.find({
    collection: 'orders',
    where: { product: { equals: productId } },
    limit: 1,
    pagination: true,
  });
  await payload.update({
    collection: 'products',
    id: productId,
    data: { orderCount: totalDocs },
  });
};

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    read: ({ req: { user } }) => isSuperAdmin(user),
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      hasMany: false,
      required: true,
    },
    {
      name: 'stripeCheckoutSessionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'stripeAccountId',
      type: 'text',
      admin: {
        description: 'The Stripe account ID for the order',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const id = typeof doc.product === 'string' ? doc.product : doc.product.id;
        await syncOrderCount(id, req.payload);
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const id = typeof doc.product === 'string' ? doc.product : doc.product.id;
        await syncOrderCount(id, req.payload);
      },
    ],
  },
};
