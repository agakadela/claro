import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatAsCurrency } from '@/modules/products/ui/components/price-filter';
import { TrashIcon } from 'lucide-react';

interface CheckoutItemProps {
  isLast?: boolean;
  imageUrl?: string | null;
  name: string;
  productUrl: string;
  tenantUrl: string;
  tenantName: string;
  price: number;
  onRemove: () => void;
}

export function CheckoutItem({
  isLast,
  imageUrl,
  name,
  productUrl,
  tenantUrl,
  tenantName,
  price,
  onRemove,
}: CheckoutItemProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 border-b',
        isLast && 'border-b-0',
      )}
    >
      <div className='overflow-hidden border-r'>
        <div className='relative aspect-square h-full'>
          <Image
            src={imageUrl ?? 'https://prd.place/400'}
            alt={name}
            fill
            className='object-cover'
          />
        </div>
      </div>
      <div className='py-4 flex flex-col justify-between'>
        <div>
          <Link href={productUrl} className='line-clamp-2'>
            <h4 className='font-bold underline'>{name}</h4>
          </Link>
          <Link href={tenantUrl}>
            <p className='font-medium underline text-gray-500'>{tenantName}</p>
          </Link>
        </div>
      </div>
      <div className='py-4 flex flex-col justify-between'>
        <p className='font-medium'>{formatAsCurrency(price)}</p>
        <button
          onClick={onRemove}
          className='text-sm text-gray-500 underline flex items-center gap-1 cursor-pointer'
        >
          <TrashIcon className='size-4' />
          Remove
        </button>
      </div>
    </div>
  );
}
