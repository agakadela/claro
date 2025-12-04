import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { SearchParams } from 'nuqs';
import { loadProductsFilters } from '@/modules/products/hooks/use-products-filters';
import { ProductListView } from '@/modules/products/ui/views/product-list-view';
import { DEFAULT_PRODUCTS_LIMIT } from '@/modules/products/constants';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { category } = await params;
  const filters = await loadProductsFilters(searchParams);
  const queryClient = getQueryClient();

  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions(
      { category, ...filters, limit: DEFAULT_PRODUCTS_LIMIT },
      {
        getNextPageParam: (lastPage) =>
          lastPage.docs.length > 0 ? lastPage.nextPage : undefined,
      }
    )
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={category} />
    </HydrationBoundary>
  );
}
