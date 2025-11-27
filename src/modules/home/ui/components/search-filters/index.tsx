'use client';

import { SearchInput } from './search-input';
import { CategoriesMenu } from './categories-menu';
import { useParams } from 'next/navigation';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { CategoriesGetManyOutput } from '@/modules/categories/types';
import { DEFAULT_BACKGROUND_COLOR } from '@/modules/home/constants';
import { BreadcrumbsNavigation } from './breadcrumbs-navigation';
import { sanitizeColor } from '@/lib/utils';

export function SearchFilters() {
  const params = useParams();
  const trpc = useTRPC();
  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions()
  ) as { data: CategoriesGetManyOutput };

  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam ?? 'all';
  const activeCategoryData =
    categories.find((category) => category.slug === activeCategory) ?? null;

  const activeCategoryColor = sanitizeColor(
    activeCategoryData?.color ?? DEFAULT_BACKGROUND_COLOR,
    DEFAULT_BACKGROUND_COLOR
  );

  const activeSubcategory = params.subcategory as string | undefined;
  const activeSubcategoryName =
    activeCategoryData?.subcategories?.find(
      (subcategory) => subcategory.slug === activeSubcategory
    )?.name ?? null;

  return (
    <div
      className='flex flex-col gap-4 w-full px-4 lg:px-12 py-8 border-b'
      style={{ backgroundColor: activeCategoryColor }}
    >
      <SearchInput />
      <div className='hidden lg:block'>
        <CategoriesMenu activeCategory={activeCategoryData} />
      </div>
      <BreadcrumbsNavigation
        activeCategory={activeCategoryData}
        activeSubcategory={activeSubcategoryName}
      />
    </div>
  );
}

export function SearchFiltersSkeleton() {
  return (
    <div
      className='flex flex-col gap-4 w-full px-4 lg:px-12 py-8 border-b'
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <SearchInput disabled />
      <div className='hidden lg:block'>
        <div className='h-10 w-full bg-gray-200 rounded-md' />
      </div>
    </div>
  );
}
