import { Category } from '@/payload-types';
import { SearchInput } from './search-input';
import { CategoriesMenu } from './categories-menu';

export function SearchFilters({ categories }: { categories: Category[] }) {
  return (
    <div className='flex flex-col gap-4 w-full px-4 lg:px-12 py-8 border-b'>
      <SearchInput />
      <CategoriesMenu categories={categories} />
    </div>
  );
}
