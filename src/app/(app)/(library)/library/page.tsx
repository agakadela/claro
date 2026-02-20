import { getQueryClient, trpc, caller } from '@/trpc/server';
import { LibraryView } from '@/modules/library/ui/views/library-view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { DEFAULT_PRODUCTS_LIMIT } from '@/modules/products/constants';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const session = await caller.auth.session();

  if (!session?.user) {
    redirect('/sign-in');
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.library.getMany.infiniteQueryOptions({
      limit: DEFAULT_PRODUCTS_LIMIT,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LibraryView />
    </HydrationBoundary>
  );
}
