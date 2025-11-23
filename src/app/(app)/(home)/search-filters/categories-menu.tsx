import { Category } from '@/payload-types';
import { CategoryDropdown } from './category-dropdown';

export function CategoriesMenu({ categories }: { categories: Category[] }) {
  return (
    <div className='relative w-full'>
      <div className='flex items-center flex-nowrap'>
        {categories.map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={false}
              isNavHovered={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
