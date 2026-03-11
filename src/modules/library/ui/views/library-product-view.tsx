'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { ReviewSidebar } from '@/modules/library/ui/components/review-sidebar';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ReviewFormSkeleton } from '../components/review-form';

export function LibraryProductView({ productId }: { productId: string }) {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.library.getOne.queryOptions({ productId }),
  );
  return (
    <div className='min-h-screen bg-white'>
      <nav className='p-4 bg-[#F4f4f0] w-full border-b'>
        <Link href='/library' className='flex items-center gap-2'>
          <ArrowLeftIcon className='size-4' />
          <span className='text-base font-medium'>Back to library</span>
        </Link>
      </nav>
      <header className='py-8 bg-[#F4f4f0] border-b'>
        <div className='max-w-(--breakpoint-2xl) mx-auto px-4 lg:px-12'>
          <h1 className='text-4xl font-medium'>{product.name}</h1>
        </div>
      </header>
      <section className='max-w-(--breakpoint-2xl) mx-auto px-4 lg:px-12 py-10'>
        <div className='grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16'>
          <div className='lg:col-span-2'>
            <div className='p-4 bg-white border rounded-md gap-4'>
              <Suspense fallback={<ReviewFormSkeleton />}>
                <ReviewSidebar productId={productId} />
              </Suspense>
            </div>
          </div>
          <div className='lg:col-span-5'>
            <div className='font-medium italic text-muted-foreground'>
              Description
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function LibraryProductViewSkeleton() {
  return (
    <div className='min-h-screen bg-white'>
      <nav className='p-4 bg-[#F4f4f0] w-full border-b'>
        <Link href='/library' className='flex items-center gap-2'>
          <ArrowLeftIcon className='size-4' />
          <span className='text-base font-medium'>Back to library</span>
        </Link>
      </nav>
    </div>
  );
}
