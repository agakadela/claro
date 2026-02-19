import { TenantNavbar } from '@/modules/tenants/ui/components/navbar';
import { TenantFooter } from '@/modules/tenants/ui/components/footer';
import { getQueryClient, trpc } from '@/trpc/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { TenantNavbarSkeleton } from '@/modules/tenants/ui/components/navbar';

export default async function TenantHomeLayout({
  children,
  params,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({ slug }));
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<TenantNavbarSkeleton />}>
          <TenantNavbar tenantSlug={slug} />
        </Suspense>
      </HydrationBoundary>
      <div className='flex-1 bg-gray-50'>
        <div className='max-w-(--breakpoint-2xl) mx-auto'>{children}</div>
      </div>
      <TenantFooter />
    </div>
  );
}
