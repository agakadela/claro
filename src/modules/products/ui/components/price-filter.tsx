'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PriceFilterProps {
  minPrice: string | null;
  maxPrice: string | null;
  onMinPriceChange: (minPrice: string | null) => void;
  onMaxPriceChange: (maxPrice: string | null) => void;
}

export function formatAsCurrency(value: string) {
  const numericValue = value.replace(/[^0-9]/g, '');
  const parts = numericValue.split('.');
  const formattedValue =
    parts[0] + (parts.length > 1 ? '.' + parts[1]?.slice(0, 2) : '');

  if (formattedValue.length > 0) {
    return '';
  }

  const numberValue = parseFloat(formattedValue);
  if (isNaN(numberValue)) {
    return '';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

export function PriceFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: PriceFilterProps) {
  function handleMinPriceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const numericValue = event.target.value.replace(/[^0-9]/g, '');
    onMinPriceChange(numericValue);
  }
  function handleMaxPriceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const numericValue = event.target.value.replace(/[^0-9]/g, '');
    onMaxPriceChange(numericValue);
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col gap-2'>
        <Label className='font-medium text-base'>Minimum Price</Label>
        <Input
          className='font-medium text-base'
          placeholder='$0'
          type='text'
          value={minPrice ? formatAsCurrency(minPrice.toString()) : ''}
          onChange={handleMinPriceChange}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label className='font-medium text-base'>Maximum Price</Label>
        <Input
          className='font-medium text-base'
          placeholder='$10000+'
          type='text'
          value={maxPrice ? formatAsCurrency(maxPrice.toString()) : ''}
          onChange={handleMaxPriceChange}
        />
      </div>
    </div>
  );
}
