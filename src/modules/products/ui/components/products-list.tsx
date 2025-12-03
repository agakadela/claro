'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export function ProductsListSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <div className='h-40 w-full bg-gray-200 rounded-md animate-pulse' />
      <div className='h-40 w-full bg-gray-200 rounded-md animate-pulse' />
      <div className='h-40 w-full bg-gray-200 rounded-md animate-pulse' />
    </div>
  );
}

export function ProductsList({ category }: { category: string }) {
  const trpc = useTRPC();
  const { data: products } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({ category })
  );
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
      {products.docs.map((product) => (
        <div key={product.id} className='border rounded-md bg-white'>
          <h2 className='text-xl font-medium'>{product.name}</h2>
          <p className='text-sm text-gray-500'>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
