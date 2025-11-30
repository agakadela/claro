'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { ProductsGetManyOutput } from '../../types';
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
  ) as { data: ProductsGetManyOutput };
  return (
    <div>
      {products.docs.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
