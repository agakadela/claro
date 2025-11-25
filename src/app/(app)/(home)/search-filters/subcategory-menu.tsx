import { Category } from '@/payload-types';
import Link from 'next/link';
import { CategoriesGetManyOutput } from '@/modules/categories/types';

interface SubcategoryMenuProps {
  category: CategoriesGetManyOutput[1];
  isOpen: boolean;
  position: { top: number; left: number };
}

export function SubcategoryMenu({
  category,
  isOpen,
  position,
}: SubcategoryMenuProps) {
  if (!isOpen || !category.subcategories || category.subcategories.length === 0)
    return null;

  return (
    <div
      className='fixed z-100'
      style={{ top: position.top, left: position.left }}
    >
      <div className='h-3 w-60 ' />
      <div
        style={{ backgroundColor: category.color ?? 'bg-gray-50' }}
        className='w-60 text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]'
      >
        <div>
          {category.subcategories.map((subcategory: Category) => (
            <Link
              key={subcategory.slug}
              href={`/${category.slug}/${subcategory.slug}`}
              className='flex justify-between items-center w-full text-left p-4 underline font-medium hover:bg-black hover:text-white'
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
