'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useProductsFilters } from '../../hooks/use-products-filters';
import { ProductCard, ProductCardSkeleton } from './product-card';
import { DEFAULT_PRODUCTS_LIMIT } from '../../constants';
import { Button } from '@/components/ui/button';
import { ArrowDown, InfoIcon } from 'lucide-react';

export function ProductsListSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
      {Array.from({ length: DEFAULT_PRODUCTS_LIMIT }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProductsList({
  category,
  tenantSlug,
}: {
  category: string;
  tenantSlug?: string;
}) {
  const [filters] = useProductsFilters();
  const trpc = useTRPC();
  const {
    data: products,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions(
      { ...filters, category, tenantSlug, limit: DEFAULT_PRODUCTS_LIMIT },
      {
        getNextPageParam: (lastPage) =>
          lastPage.docs.length > 0 ? lastPage.nextPage : undefined,
      },
    ),
  );

  if (products.pages?.[0]?.docs.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center border border-black border-dashed gap-y-4 bg-white w-full rounded-lg   p-8'>
        <InfoIcon className='size-10 text-gray-500' />
        <p className='text-base font-medium'>No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
        {products.pages.flatMap((page) =>
          page.docs.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.image?.url}
              authorUsername={product.tenant?.name}
              authorSlug={product.tenant?.slug}
              authorAvatarUrl={product.tenant?.image?.url}
              reviewRating={4.5}
              reviewCount={10}
              price={product.price}
            />
          )),
        )}
      </div>
      <div className='flex justify-center pt-8'>
        {hasNextPage && (
          <Button
            variant='elevated'
            type='button'
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            <p className='font-medium text-base'>Load more</p>
            <ArrowDown className='size-4' />
          </Button>
        )}
      </div>
    </>
  );
}
