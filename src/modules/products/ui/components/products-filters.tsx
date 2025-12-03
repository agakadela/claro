'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { PriceFilter } from './price-filter';
import { useProductsFilters } from '../../hooks/use-products-filters';

interface ProductsFiltersProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

function ProductsFilter({ title, className, children }: ProductsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;

  return (
    <div className={cn('p-4 border-b flex flex-col gap-2', className)}>
      <div
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        className='flex items-center justify-between cursor-pointer'
      >
        <p className='font-medium'>{title}</p>
        <Icon className='size-4' />
      </div>
      {isOpen && children}
    </div>
  );
}

export function ProductsFilters() {
  const [filters, setFilters] = useProductsFilters();

  function onChange(key: keyof typeof filters, value: unknown) {
    setFilters({ ...filters, [key]: value });
  }

  return (
    <div className='border rounded-md bg-white'>
      <div className='p-4 border-b flex items-center justify-between'>
        <p className='text-lg font-medium'>Filters</p>
        <Button variant='clear' type='button' onClick={() => {}}>
          Clear
        </Button>
      </div>
      <ProductsFilter title='Price' className='border-b-0'>
        <PriceFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(value) => onChange('minPrice', value)}
          onMaxPriceChange={(value) => onChange('maxPrice', value)}
        />
      </ProductsFilter>
    </div>
  );
}
