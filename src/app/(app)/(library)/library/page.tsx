import { getQueryClient, trpc } from '@/trpc/server';
import { LibraryView } from './ui/views/library-view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { DEFAULT_PRODUCTS_LIMIT } from '@/modules/products/constants';

export default async function LibraryPage() {
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
