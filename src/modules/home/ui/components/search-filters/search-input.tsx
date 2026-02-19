'use client';

import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { BookmarkCheckIcon, ListFilterIcon, SearchIcon } from 'lucide-react';
import { CategoriesSidebar } from './categories-sidebar';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

interface SearchInputProps {
  disabled?: boolean;
}
export function SearchInput({ disabled }: SearchInputProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const trpc = useTRPC();
  const { data: session } = useQuery(trpc.auth.session.queryOptions());

  return (
    <div className='flex items-center gap-2 w-full'>
      <CategoriesSidebar
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

      {session?.user ? (
        <Button asChild variant='elevated'>
          <Link prefetch href='/library'>
            <BookmarkCheckIcon className='mr-2' />
            Library
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
