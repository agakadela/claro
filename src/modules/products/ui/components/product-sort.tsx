'use client';

import { Button } from '@/components/ui/button';
import {
  sortValues,
  useProductsFilters,
} from '../../hooks/use-products-filters';
import { cn } from '@/lib/utils';

function SortButton({
  value,
  onClick,
  isActive,
}: {
  value: (typeof sortValues)[number];
  onClick: () => void;
  isActive: boolean;
}) {
  const label =
    value.charAt(0).toUpperCase() + value.slice(1).replaceAll('_', ' ');
  return (
    <Button
      variant='outline'
      size='sm'
      className={cn(
        'bg-white hover:bg-white',
        isActive && 'bg-transparent border-transparent hover:bg-transparent'
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function ProductSort() {
  const [filters, setFilters] = useProductsFilters();

  return (
    <div className='flex items-center gap-2'>
      <SortButton
        value='for_you'
        onClick={() => setFilters({ sort: 'for_you' })}
        isActive={filters.sort === 'for_you'}
      />
      <SortButton
        value='newest'
        onClick={() => setFilters({ sort: 'newest' })}
        isActive={filters.sort === 'newest'}
      />
      <SortButton
        value='trending'
        onClick={() => setFilters({ sort: 'trending' })}
        isActive={filters.sort === 'trending'}
      />
    </div>
  );
}
