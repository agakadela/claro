import { isSuperAdmin } from '@/lib/access';
import { CollectionConfig } from 'payload';
import { Tenant } from '@/payload-types';
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical';

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true;
      const tenantOrId = user?.tenants?.[0]?.tenant;
      if (!tenantOrId || typeof tenantOrId === 'string') return false;
      return Boolean((tenantOrId as Tenant).stripeDetailsSubmitted);
    },
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  admin: {
    useAsTitle: 'name',
    description:
      'Please note that products are not visible to customers until you submit your Stripe details.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'The description of the product',
      },
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
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'alt',
                    type: 'text',
                  },
                ],
              },
            },
          }),
        ],
      }),
      admin: {
        description:
          'Protected content for customers after purchase. Add product documentation, tutorials, downloadable files, etc. Supports Markdown and rich text.',
      },
    },
    {
      name: 'isArchived',
      label: 'Archive',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Archive the product to prevent it from being visible to customers.',
      },
    },
    {
      name: 'isPrivate',
      label: 'Private',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Make the product private to only be visible to the tenant and not to the public.',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-maintained by Reviews hook',
      },
    },
    {
      name: 'orderCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-maintained by Orders hook',
      },
    },
  ],
};
