'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PriceFilterProps {
  minPrice: number | null;
  maxPrice: number | null;
  onMinPriceChange: (minPrice: number | null) => void;
  onMaxPriceChange: (maxPrice: number | null) => void;
}

export function formatAsCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function PriceFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: PriceFilterProps) {
  function handleMinPriceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const numericValue = event.target.value.replace(/[^0-9]/g, '');
    onMinPriceChange(numericValue ? parseInt(numericValue, 10) : null);
  }
  function handleMaxPriceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const numericValue = event.target.value.replace(/[^0-9]/g, '');
    onMaxPriceChange(numericValue ? parseInt(numericValue, 10) : null);
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col gap-2'>
        <Label className='font-medium text-base'>Minimum Price</Label>
        <Input
          className='font-medium text-base'
          placeholder='$0'
          type='text'
          inputMode='numeric'
          value={minPrice !== null ? formatAsCurrency(minPrice) : ''}
          onChange={handleMinPriceChange}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label className='font-medium text-base'>Maximum Price</Label>
        <Input
          className='font-medium text-base'
          placeholder='$10000+'
          type='text'
          inputMode='numeric'
          value={maxPrice !== null ? formatAsCurrency(maxPrice) : ''}
          onChange={handleMaxPriceChange}
        />
      </div>
    </div>
  );
}
