import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import {
  LibraryProductsList,
  LibraryProductsListSkeleton,
} from '@/modules/library/ui/components/library-products-list';
import { Suspense } from 'react';

export function LibraryView() {
  return (
    <div className='min-h-screen bg-white'>
      <nav className='p-4 bg-[#F4f4f0] w-full border-b'>
        <Link href='/' className='flex items-center gap-2'>
          <ArrowLeftIcon className='size-4' />
          <span className='text-base font-medium'>Continue shopping</span>
        </Link>
      </nav>
      <header className='py-8 bg-[#F4f4f0] border-b'>
        <div className='flex flex-col gap-y-4 max-w-(--breakpoint-2xl) mx-auto px-4 lg:px-12'>
          <h1 className='text-4xl font-medium'>Library</h1>
          <p className='font-medium'>Your purchased products</p>
        </div>
      </header>
      <section className='max-w-(--breakpoint-2xl) mx-auto px-4 lg:px-12 py-10'>
        <Suspense fallback={<LibraryProductsListSkeleton />}>
          <LibraryProductsList />
        </Suspense>
      </section>
    </div>
  );
}
