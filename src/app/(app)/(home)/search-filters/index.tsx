import { SearchInput } from './search-input';
import { CategoriesMenu } from './categories-menu';
import { CustomCategory } from '../types';

export function SearchFilters({
  categories,
}: {
  categories: CustomCategory[];
}) {
  return (
    <div className='flex flex-col gap-4 w-full px-4 lg:px-12 py-8 border-b'>
      <SearchInput categories={categories} />
      <div className='hidden lg:block'>
        <CategoriesMenu categories={categories} />
      </div>
    </div>
  );
}
