import { SearchInput } from './search-input';
import { CategoriesMenu } from './categories-menu';

export function SearchFilters() {
  return (
    <div
      className='flex flex-col gap-4 w-full px-4 lg:px-12 py-8 border-b'
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <SearchInput />
      <div className='hidden lg:block'>
        <CategoriesMenu />
      </div>
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
