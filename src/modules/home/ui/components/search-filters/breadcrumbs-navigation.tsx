import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { CategoriesGetManyOutput } from '@/modules/categories/types';
import Link from 'next/link';

export function BreadcrumbsNavigation({
  activeCategory,
  activeSubcategory,
}: {
  activeCategory: CategoriesGetManyOutput[1] | null;
  activeSubcategory: string | null;
}) {
  if (!activeCategory || activeCategory.slug === 'all') return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {activeSubcategory ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className='text-xl font-medium underline text-primary'
              >
                <Link href={`/${activeCategory.slug}`}>
                  {activeCategory.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className='text-primary font-medium text-lg'>
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className='text-xl font-medium'>
                {activeSubcategory}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className='text-xl font-medium'>
              {activeCategory.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
