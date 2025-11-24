'use client';

import { CustomCategory } from '../types';
import { NavbarSidebar } from '../navbar-sidebar';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CategoryDropdown } from './category-dropdown';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CategoriesSidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: CustomCategory[];
}

export function CategoriesSidebar({
  isOpen,
  onOpenChange,
  categories,
}: CategoriesSidebarProps) {
  const router = useRouter();
  const [parentCategories, setParentCategories] = useState<
    CustomCategory[] | null | undefined
  >(undefined);
  const [selectedCategory, setSelectedCategory] =
    useState<CustomCategory | null>(null);

  // Explicit branching: null = show root, undefined = use categories as-is, else use parentCategories
  const currentCategories =
    parentCategories === null
      ? categories.filter((category) => category.parent === null)
      : parentCategories === undefined
        ? categories
        : parentCategories;

  function handleOpenChange(isOpen: boolean) {
    setParentCategories(undefined);
    setSelectedCategory(null);
    onOpenChange(isOpen);
  }

  function handleCategoryClick(category: CustomCategory) {
    if (category.subcategories && category.subcategories.length > 0) {
      setParentCategories(category.subcategories as CustomCategory[]);
      setSelectedCategory(category);
    } else {
      if (parentCategories && selectedCategory) {
        router.push(`/${selectedCategory.slug}/${category.slug}`);
      } else {
        router.push(`/${category.slug}`);
      }
      handleOpenChange(false);
    }
  }

  function handleBackClick() {
    setParentCategories(null);
    setSelectedCategory(null);
  }

  const backgroundColor = selectedCategory?.color ?? 'white';

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side='left'
        className='p-0 transition-none'
        style={{ backgroundColor }}
      >
        <SheetHeader className='p-4 border-b'>
          <div className='flex items-center'>
            <SheetTitle>Categories</SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className='flex flex-col overflow-y-auto h-full pb-2'>
          {parentCategories !== null && parentCategories !== undefined && (
            <button
              className='w-full text-left p-4 hover:bg-black hover:text-white transition-colors flex items-center text-base font-medium cursor-pointer'
              onClick={() => handleBackClick()}
            >
              <ChevronLeftIcon className='size-4' />
              Back
            </button>
          )}
          {currentCategories.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category)}
              className='w-full text-left p-4 hover:bg-black hover:text-white transition-colors justify-between flex items-center text-base font-medium cursor-pointer'
            >
              {category.name}
              {category.subcategories && category.subcategories.length > 0 && (
                <ChevronRightIcon className='size-4' />
              )}
            </button>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
