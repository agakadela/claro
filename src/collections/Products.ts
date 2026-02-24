import { isSuperAdmin } from '@/lib/access';
import { CollectionConfig } from 'payload';
import { Tenant } from '@/payload-types';

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true;
      const tenantOrId = user?.tenants?.[0]?.tenant;
      if (!tenantOrId || typeof tenantOrId === 'string') return false;
      return Boolean((tenantOrId as Tenant).stripeDetailsSubmitted);
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Price in USD',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'refundPolicy',
      type: 'select',
      options: [
        {
          label: '7 days',
          value: '7_days',
        },
        {
          label: '14 days',
          value: '14_days',
        },
        {
          label: '30 days',
          value: '30_days',
        },
        {
          label: '60 days',
          value: '60_days',
        },
        {
          label: 'No refund',
          value: 'no_refund',
        },
      ],
      defaultValue: '30_days',
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description:
          'Protected content for customers after purchase. Add product documentation, tutorials, downloadable files, etc. Supports Markdown and rich text.',
      },
    },
  ],
};
