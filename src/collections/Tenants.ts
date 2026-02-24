import { isSuperAdmin } from '@/lib/access';
import type { CollectionConfig } from 'payload';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  admin: {
    useAsTitle: 'slug',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Store Name',
      admin: {
        description: 'The name of your store',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      access: {
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
      label: 'Store Slug',
      admin: {
        description: 'The slug of your store (e.g. [slug].claro.com)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Store Image',
      admin: {
        description: 'The image of your store',
      },
    },
    {
      name: 'stripeConnectAccountId',
      type: 'text',
      required: true,
      label: 'Stripe Connect Account ID',
      access: {
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
      admin: {
        description: 'The Stripe Connect account ID for your store',
      },
    },
    {
      name: 'stripeDetailsSubmitted',
      type: 'checkbox',
      label: 'Stripe Details Submitted',
      access: {
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
      admin: {
        readOnly: true,
        description:
          'You cannot create products until the Stripe details have been submitted',
      },
    },
  ],
};
