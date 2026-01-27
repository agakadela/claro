'use client';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { generateTenantUrl } from '@/lib/utils';

export function TenantNavbarSkeleton() {
  return (
    <nav className='h-20 border-b font-medium bg-white'>
      <div className='max-w(--breakpoint-2xl) mx-auto flex items-center justify-between h-full px-4 lg:px-12'>
        <p className='text-xl font-bold'>Loading...</p>
      </div>
    </nav>
  );
}

export function TenantNavbar({ tenantSlug }: { tenantSlug: string }) {
  const trpc = useTRPC();
  const { data: tenant } = useSuspenseQuery(
    trpc.tenants.getOne.queryOptions({ slug: tenantSlug }),
  );
  return (
    <nav className='h-20 border-b font-medium bg-white'>
      <div className='max-w(--breakpoint-2xl) mx-auto flex items-center justify-between h-full px-4 lg:px-12'>
        <Link
          href={generateTenantUrl(tenantSlug)}
          className='flex items-center gap-2'
        >
          {tenant.image?.url && (
            <Image
              src={tenant.image.url}
              className='rounded-full border shrink-0 size-[32px]'
              alt={tenant.name}
              width={32}
              height={32}
            />
          )}
          <p className='text-xl font-bold'>{tenant.name}</p>
        </Link>
      </div>
    </nav>
  );
}
