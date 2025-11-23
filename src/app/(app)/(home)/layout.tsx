import { Navbar } from './navbar';
import { Footer } from './footer';
import { SearchFilters } from './search-filters';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Category } from '@/payload-types';

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getPayload({
    config: configPromise,
  });

  const categories = await payload.find({
    collection: 'categories',
    depth: 1,
    pagination: false,
    where: {
      parent: {
        exists: false,
      },
    },
  });

  const formattedCategories = categories.docs.map((category) => ({
    ...category,
    subcategories: (category.subcategories?.docs ?? []).map((subcategory) => ({
      ...(subcategory as Category), // we know it's Category not string because of depth: 1
    })),
  }));
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <SearchFilters categories={formattedCategories as Category[]} />
      <div className='flex-1 bg-gray-50'>{children}</div>
      <Footer />
    </div>
  );
}
