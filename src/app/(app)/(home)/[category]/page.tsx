import { ProductsFilters } from '@/modules/products/ui/components/products-filters';
import {
  ProductsList,
  ProductsListSkeleton,
} from '@/modules/products/ui/components/products-list';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { SearchParams } from 'nuqs';
import { loadProductsFilters } from '@/modules/products/hooks/use-products-filters';
import { ProductSort } from '@/modules/products/ui/components/product-sort';

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

  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({ category, ...filters })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='px-4 lg:px-12 py-8 flex flex-col gap-4'>
        <div className='flex flex-col justify-between lg:flex-row lg:items-center gap-y-2 lg:gap-y-0'>
          <p className='text-2xl font-medium'>For you</p>
          <ProductSort />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12'>
          <div className='lg:col-span-2'>
            <ProductsFilters />
          </div>
          <div className='lg:col-span-4 xl:col-span-6'>
            <Suspense fallback={<ProductsListSkeleton />}>
              <ProductsList category={category} />
            </Suspense>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
}
