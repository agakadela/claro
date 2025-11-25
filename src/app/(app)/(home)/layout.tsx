import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { SearchFilters, SearchFiltersSkeleton } from './search-filters';
import { getQueryClient, trpc } from '@/trpc/server';
import { Suspense } from 'react';

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SearchFiltersSkeleton />}>
          <SearchFilters />
        </Suspense>
      </HydrationBoundary>
      <div className='flex-1 bg-gray-50'>{children}</div>
      <Footer />
    </div>
  );
}
