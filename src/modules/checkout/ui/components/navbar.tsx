'use client';

import Link from 'next/link';
import { generateTenantUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function CheckoutNavbar({ tenantSlug }: { tenantSlug: string }) {
  return (
    <nav className='h-20 border-b font-medium bg-white'>
      <div className='max-w-(--breakpoint-2xl) mx-auto flex items-center justify-between h-full px-4 lg:px-12'>
        <p className='text-xl '>Checkout</p>
        <Button variant='elevated' asChild>
          <Link href={generateTenantUrl(tenantSlug)}>Continue shopping</Link>
        </Button>
      </div>
    </nav>
  );
}
