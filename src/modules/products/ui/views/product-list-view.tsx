import { Suspense } from 'react';
import {
  ProductsList,
  ProductsListSkeleton,
} from '../components/products-list';
import { ProductsFilters } from '../components/products-filters';
import { ProductSort } from '../components/product-sort';

export function ProductListView({ category }: { category?: string }) {
  return (
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
            <ProductsList category={category ?? 'all'} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
