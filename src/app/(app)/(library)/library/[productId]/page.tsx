import { getQueryClient, trpc, caller } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { LibraryProductView } from '@/modules/library/ui/views/library-product-view';
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
  await Promise.all([
    queryClient.prefetchQuery(trpc.library.getOne.queryOptions({ productId })),
    queryClient.prefetchQuery(trpc.reviews.getOne.queryOptions({ productId })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <LibraryProductView productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
}
