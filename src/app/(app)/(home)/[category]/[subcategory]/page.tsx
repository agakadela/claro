import { loadProductsFilters } from '@/modules/products/hooks/use-products-filters';
import { ProductListView } from '@/modules/products/ui/views/product-list-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SearchParams } from 'nuqs';
import { DEFAULT_PRODUCTS_LIMIT } from '@/modules/products/constants';

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { subcategory } = await params;
  const filters = await loadProductsFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions(
      { category: subcategory, ...filters, limit: DEFAULT_PRODUCTS_LIMIT },
      {
        getNextPageParam: (lastPage) =>
          lastPage.docs.length > 0 ? lastPage.nextPage : undefined,
      }
    )
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={subcategory} />
    </HydrationBoundary>
  );
}
