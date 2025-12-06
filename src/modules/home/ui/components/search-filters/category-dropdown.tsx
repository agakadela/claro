'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
import { SubcategoryMenu } from './subcategory-menu';
import Link from 'next/link';
import { CategoriesGetManyOutput } from '@/modules/categories/types';

interface CategoryDropdownProps {
  category: CategoriesGetManyOutput[1];
  isActive: boolean;
  isNavHovered: boolean;
}
export function CategoryDropdown({
  category,
  isActive,
  isNavHovered,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function onMouseEnter() {
    if (category.subcategories) {
      setIsOpen(true);
    }
  }

  function onMouseLeave() {
    setIsOpen(false);
  }

  return (
    <div
      className='relative'
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className='relative'>
        <Button
          variant='elevated'
          className={cn(
            'h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black',
            isActive && !isNavHovered && 'bg-white border-primary',
            isOpen &&
              'bg-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[4px] -translate-y-[4px]'
          )}
          asChild
        >
          <Link href={`/${category.slug}`}>{category.name}</Link>
        </Button>
        {category.subcategories && category.subcategories.length > 0 && (
          <div
            className={cn(
              'opacity-0 -bottom-3 w-0 h-0 border-l-10 border-r-10 border-b-10 border-r-transparent border-l-transparent border-b-black left-1/2 -translate-x-1/2 absolute',
              isOpen && 'opacity-100'
            )}
          ></div>
        )}
      </div>
      <SubcategoryMenu category={category} isOpen={isOpen} />
    </div>
  );
}
