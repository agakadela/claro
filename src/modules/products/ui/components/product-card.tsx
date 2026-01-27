import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from 'lucide-react';
import { formatAsCurrency } from './price-filter';
import { generateTenantUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  authorUsername: string;
  authorSlug: string;
  authorAvatarUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
}

export function ProductCardSkeleton() {
  return (
    <div className='flex flex-col border rounded-md bg-white overflow-hidden h-full'>
      <div className='relative aspect-square bg-gray-200 animate-pulse' />
    </div>
  );
}

export function ProductCard({
  id,
  name,
  imageUrl,
  authorUsername,
  authorSlug,
  authorAvatarUrl,
  reviewRating,
  reviewCount,
  price,
}: ProductCardProps) {
  const router = useRouter();
  const handleAuthorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(generateTenantUrl(authorSlug));
  };
  return (
    <Link href={`/products/${id}`}>
      <div className='flex flex-col border rounded-md bg-white overflow-hidden h-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]  transition-shadow duration-300'>
        <div className='relative aspect-square'>
          <Image
            src={imageUrl ?? 'https://prd.place/400'}
            alt={name}
            fill
            className='object-cover'
          />
        </div>
        <div className='flex flex-col p-4 border-y gap-3 flex-1'>
          <h3 className='text-lg font-medium line-clamp-4'>{name}</h3>
          <div className='flex items-center gap-2' onClick={handleAuthorClick}>
            {authorAvatarUrl && (
              <Image
                className='rounded-full border shrink-0 size-[20px]'
                src={authorAvatarUrl}
                alt={authorUsername}
                width={20}
                height={20}
              />
            )}
            <span
              className='text-sm text-gray-500 underline'
              onClick={handleAuthorClick}
            >
              {authorUsername}
            </span>
          </div>
          {reviewCount > 0 && (
            <div className='flex items-center gap-1'>
              <StarIcon
                className='size-4 text-yellow-500'
                fill='currentColor'
              />
              <span className='text-sm'>
                {reviewRating} ({reviewCount})
              </span>
            </div>
          )}
        </div>
        <div className='p-4'>
          <div className='relative px-2 py-1 border bg-pink-400 w-fit'>
            <p className='text-sm'>{formatAsCurrency(price)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
