'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { formatAsCurrency } from '../components/price-filter';
import Link from 'next/link';
import { generateTenantUrl } from '@/lib/utils';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { LinkIcon, StarIcon } from 'lucide-react';
import { Fragment } from 'react';
import { Progress } from '@/components/ui/progress';
import { Product } from '@/payload-types';

export function ProductDetailView({
  productId,
  tenantSlug,
}: {
  productId: string;
  tenantSlug: string;
}) {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId, tenantSlug }),
  );

  return (
    <div className='px-4 lg:px-12 py-10'>
      <div className='border rounded-sm bg-white overflow-hidden'>
        <div className='relative aspect-[3.9] border-b'>
          <Image
            src={product.image?.url ?? 'https://prd.place/400'}
            alt={product.name}
            fill
            className='object-cover'
          />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-6'>
          <div className='col-span-4'>
            <div className='p-6'>
              <h1 className='text-4xl font-medium'>{product.name}</h1>
            </div>
            <div className='border-y flex'>
              <div className='px-6 py-4 flex items-center justify-center border-r'>
                <div className='px-2 py-1 border bg-pink-400 w-fit'>
                  <p className='text-base font-medium'>
                    {formatAsCurrency(product.price)}
                  </p>
                </div>
              </div>
              <div className='px-6 py-4 flex items-center justify-center lg:border-r'>
                <Link
                  href={`${generateTenantUrl(tenantSlug)}`}
                  className='flex items-center gap-2'
                >
                  {product.tenant.image?.url && (
                    <Image
                      src={product.tenant.image.url}
                      alt={product.tenant.name}
                      width={20}
                      height={20}
                      className='rounded-full border shrink-0 size-[20px]'
                    />
                  )}
                  <span className='text-base underline font-medium'>
                    {product.tenant.name}
                  </span>
                </Link>
              </div>
              <div className='hidden lg:flex px-6 py-4 items-center justify-center'>
                <div className='flex items-center gap-1'>
                  <StarRating rating={3} />
                </div>
              </div>
            </div>
            <div className='block lg:hidden px-6 py-4 items-center justify-center border-b'>
              <div className='flex items-center gap-1'>
                <StarRating rating={4} />
              </div>
              <p className='text-sm text-gray-500'>4.5 (10 reviews)</p>
            </div>

            <div className='p-6'>
              {product.description ? (
                <p className='text-sm text-gray-500'>{product.description}</p>
              ) : (
                <p className='text-sm text-gray-500'>
                  No description available
                </p>
              )}
            </div>
          </div>
          <div className='col-span-2'>
            <div className='border-t lg:border-t-0 lg:border-l h-full'>
              <div className='flex flex-col gap-4 p-6 border-b'>
                <div className='flex flex-row items-center gap-2'>
                  <Button variant='elevated' className='flex-1 bg-pink-400'>
                    Add to cart
                  </Button>
                  <Button
                    variant='elevated'
                    className='size-12'
                    onClick={() => {}}
                    disabled={false}
                  >
                    <LinkIcon />
                  </Button>
                </div>
                <p className='text-center font-medium'>
                  {product.refundPolicy === 'no_refund'
                    ? 'No refunds'
                    : product.refundPolicy
                      ? `${product.refundPolicy.replace('_', ' ')} money back guarantee`
                      : 'Refund policy not available'}
                </p>
              </div>
              <div className='p-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-xl font-medium'>Ratings</h3>
                  <div className='flex itens-center gap-x-1 font-medium'>
                    <StarIcon className='size-4 fill-yellow-500' />
                    <span className='text-sm'>4.5</span>
                    <span className='text-sm'>(10 reviews)</span>
                  </div>
                </div>
                <div className='grid grid-cols-[auto_1fr_auto] gap-3 mt-4'>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <Fragment key={star}>
                      <div className='font-medium'>
                        {star} {star === 1 ? 'star' : 'stars'}
                      </div>
                      <Progress value={0} className='h-lh' />
                      <div className='font-medium'>{0}%</div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
