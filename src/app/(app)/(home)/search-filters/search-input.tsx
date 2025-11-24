'use client';

import { Input } from '@/components/ui/input';
import { ListFilterIcon, SearchIcon } from 'lucide-react';
import { CustomCategory } from '../types';
import { CategoriesSidebar } from './categories-sidebar';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  disabled?: boolean;
  categories: CustomCategory[];
}
export function SearchInput({ disabled, categories }: SearchInputProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='flex items-center gap-2 w-full'>
      <CategoriesSidebar
        categories={categories}
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />
      <div className='relative w-full'>
        <SearchIcon className='size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2' />
        <Input
          className='pl-8'
          type='text'
          placeholder='Search products'
          disabled={disabled}
        />
      </div>

      <Button
        variant='elevated'
        className='size-12 shrink-0 flex lg:hidden'
        onClick={() => setIsSidebarOpen(true)}
        aria-label='Open filters'
      >
        <ListFilterIcon className='size-4' />
      </Button>
      {/* TODO: Add categories view all button */}
      {/* TODO: Add library button */}
    </div>
  );
}
