import { isSuperAdmin } from '@/lib/access';
import type { CollectionConfig } from 'payload';
import type { Payload } from 'payload';

const syncReviewCount = async (productId: string, payload: Payload) => {
  const { totalDocs } = await payload.find({
    collection: 'reviews',
    where: { product: { equals: productId } },
    limit: 1,
    pagination: true,
  });
  await payload.update({
    collection: 'products',
    id: productId,
    data: { reviewCount: totalDocs },
  });
};

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: {
    read: ({ req: { user } }) => isSuperAdmin(user),
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  indexes: [
    {
      fields: ['product', 'user'],
      unique: true,
    },
  ],
  admin: {
    useAsTitle: 'description',
  },
  fields: [
    {
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },

    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      hasMany: false,
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, previousDoc, operation }) => {
        const currentId =
          typeof doc.product === 'string'
            ? doc.product
            : doc.product?.id;
        const previousId =
          typeof previousDoc?.product === 'string'
            ? previousDoc.product
            : previousDoc?.product?.id;

        if (operation === 'update' && previousId && previousId !== currentId) {
          await syncReviewCount(previousId, req.payload);
        }
        if (currentId) {
          await syncReviewCount(currentId, req.payload);
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const id =
          typeof doc.product === 'string' ? doc.product : doc.product?.id;
        if (id) {
          await syncReviewCount(id, req.payload);
        }
      },
    ],
  },
};
