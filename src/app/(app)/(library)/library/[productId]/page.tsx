import { getQueryClient, trpc, caller } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import {
  LibraryProductView,
  LibraryProductViewSkeleton,
} from '@/modules/library/ui/views/library-product-view';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function LibraryProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const session = await caller.auth.session();

  if (!session?.user) {
    redirect('/sign-in');
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.library.getOne.queryOptions({ productId }),
  );
  // reviews.getOne is intentionally not prefetched — ReviewSidebar fetches it
  // client-side so the ReviewFormSkeleton boundary actually renders.

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LibraryProductViewSkeleton />}>
        <LibraryProductView productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
}
