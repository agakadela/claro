import { SearchParams } from 'nuqs';
import { getQueryClient, trpc } from '@/trpc/server';
import { loadProductsFilters } from '@/modules/products/hooks/use-products-filters';
import { ProductListView } from '@/modules/products/ui/views/product-list-view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { DEFAULT_PRODUCTS_LIMIT } from '@/modules/products/constants';

export default async function TenantPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const filters = await loadProductsFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      tenantSlug: slug,
      limit: DEFAULT_PRODUCTS_LIMIT,
    })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView tenantSlug={slug} />
    </HydrationBoundary>
  );
}
