import type { CollectionConfig } from 'payload';
import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields';
import { isSuperAdmin } from '@/lib/access';

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsCollectionSlug: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  arrayFieldAccess: {
    read: () => true,
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
  },
  tenantFieldAccess: {
    read: () => true,
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
  },
});

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true;
      if (user && user.id) return { id: { equals: user.id } };
      return false;
    },
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user }, id }) =>
      isSuperAdmin(user) ? true : String(user?.id) === String(id),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  auth: true,
  fields: [
    {
      name: 'username',
      type: 'text',
      unique: true,
      required: true,
    },
    {
      admin: {
        position: 'sidebar',
      },
      name: 'roles',
      type: 'select',
      defaultValue: 'user',
      hasMany: true,
      options: ['super-admin', 'user'],
      access: {
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
    },
    {
      ...defaultTenantArrayField,
      admin: {
        ...defaultTenantArrayField.admin,
        position: 'sidebar',
      },
    },
  ],
};
