'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { formatAsCurrency } from '../components/price-filter';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { generateTenantUrl } from '@/lib/utils';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { CheckIcon, LinkIcon, ShoppingCartIcon, StarIcon } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const CartButton = dynamic(
  () => import('../components/cart-button').then((mod) => mod.CartButton),
  {
    ssr: false,
    loading: () => (
      <Button variant='elevated' disabled className='bg-pink-400 flex-1'>
        <ShoppingCartIcon className='size-4' />
        <span className='text-sm font-medium'>Add to cart</span>
      </Button>
    ),
  },
);

export function ProductDetailViewSkeleton() {
  return (
    <div className='px-4 lg:px-12 py-10'>
      <div className='border rounded-sm bg-white overflow-hidden'>
        <div className='relative aspect-[3.9] border-b bg-gray-200 animate-pulse' />
        <div className='grid grid-cols-1 lg:grid-cols-6'>
          <div className='col-span-4'>
            <div className='p-6'>
              <div className='h-10 w-3/4 bg-gray-200 rounded animate-pulse' />
            </div>
            <div className='border-y flex'>
              <div className='px-6 py-4 flex items-center justify-center border-r'>
                <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
              </div>
              <div className='px-6 py-4 flex items-center justify-center lg:border-r'>
                <div className='flex items-center gap-2'>
                  <div className='size-5 bg-gray-200 rounded-full animate-pulse' />
                  <div className='h-5 w-24 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>
              <div className='hidden lg:flex px-6 py-4 items-center justify-center'>
                <div className='h-5 w-28 bg-gray-200 rounded animate-pulse' />
              </div>
            </div>
            <div className='block lg:hidden px-6 py-4 items-center justify-center border-b'>
              <div className='h-5 w-28 bg-gray-200 rounded animate-pulse' />
              <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mt-1' />
            </div>
            <div className='p-6'>
              <div className='space-y-2'>
                <div className='h-4 w-full bg-gray-200 rounded animate-pulse' />
                <div className='h-4 w-5/6 bg-gray-200 rounded animate-pulse' />
                <div className='h-4 w-4/6 bg-gray-200 rounded animate-pulse' />
              </div>
            </div>
          </div>
          <div className='col-span-2'>
            <div className='border-t lg:border-t-0 lg:border-l h-full'>
              <div className='flex flex-col gap-4 p-6 border-b'>
                <div className='flex flex-row items-center justify-end gap-2'>
                  <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse' />
                  <div className='size-12 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='h-5 w-40 mx-auto bg-gray-200 rounded animate-pulse' />
              </div>
              <div className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='h-6 w-20 bg-gray-200 rounded animate-pulse' />
                  <div className='h-5 w-28 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='grid grid-cols-[auto_1fr_auto] gap-3 mt-4'>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <Fragment key={star}>
                      <div className='h-5 w-14 bg-gray-200 rounded animate-pulse' />
                      <div className='h-5 bg-gray-200 rounded animate-pulse' />
                      <div className='h-5 w-8 bg-gray-200 rounded animate-pulse' />
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
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      toast.error('Failed to copy link. Please try again.');
    }
  }

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
                  <StarRating rating={product.reviewRating} />
                </div>
              </div>
            </div>
            <div className='block lg:hidden px-6 py-4 items-center justify-center border-b'>
              <div className='flex items-center gap-1'>
                <StarRating rating={product.reviewRating} />
              </div>
              <p className='text-sm text-gray-500'>
                {product.reviewRating.toFixed(1)} ({product.reviewCount} reviews)
              </p>
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
                <div className='flex flex-row items-center justify-end gap-2'>
                  <CartButton
                    tenantSlug={tenantSlug}
                    productId={productId}
                    isPurchased={product.isPurchased}
                  />

                  <Button
                    variant='elevated'
                    className='size-12'
                    onClick={() => handleCopyLink()}
                    disabled={isCopied}
                  >
                    {isCopied ? <CheckIcon /> : <LinkIcon />}
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
                  <div className='flex items-center gap-x-1 font-medium'>
                    <StarIcon className='size-4 fill-yellow-500' />
                    <span className='text-sm'>{product.reviewRating.toFixed(1)}</span>
                    <span className='text-sm'>
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-[auto_1fr_auto] gap-3 mt-4'>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <Fragment key={star}>
                      <div className='font-medium'>
                        {star} {star === 1 ? 'star' : 'stars'}
                      </div>
                      <Progress
                        value={product.ratingDistribution[star]}
                        className='h-lh'
                      />
                      <div className='font-medium'>
                        {product.ratingDistribution[star]}%
                      </div>
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
