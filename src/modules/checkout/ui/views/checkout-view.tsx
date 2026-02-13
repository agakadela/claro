'use client';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../../hooks/use-cart';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { CheckoutItem } from '../components/checkout-item';
import { generateTenantUrl } from '@/lib/utils';
import { CheckoutSidebar } from '../components/checkout-sidebar';
import { InfoIcon, Loader2 } from 'lucide-react';

export function CheckoutView({ tenantSlug }: { tenantSlug: string }) {
  const { productIds, removeProductFromCart } = useCart(tenantSlug);

  const trpc = useTRPC();
  const {
    data: productsData,
    error,
    isLoading,
  } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      productIds,
      tenantSlug,
    }),
  );

  useEffect(() => {
    if (
      error?.data?.code === 'NOT_FOUND' ||
      error?.data?.code === 'FORBIDDEN'
    ) {
      const errorData = error.data as {
        code: string;
        cause?: { missingIds?: string[]; invalidIds?: string[] };
      };
      const invalidIds =
        errorData.cause?.missingIds || errorData.cause?.invalidIds || [];

      invalidIds.forEach((id) => {
        removeProductFromCart(tenantSlug, id);
      });

      toast.error(
        invalidIds.length > 0
          ? `${invalidIds.length} product${invalidIds.length > 1 ? 's' : ''} removed from cart`
          : 'Some products are no longer available',
      );
    }
  }, [error, removeProductFromCart, tenantSlug]);

  if (isLoading) {
    return (
      <div className='lg:pt-16 pt-4 lg:px-12'>
        <div className='flex flex-col items-center justify-center border border-black border-dashed gap-y-4 bg-white w-full rounded-lg p-8'>
          <Loader2 className='size-10 text-gray-500 animate-spin' />
          <p className='text-base font-medium'>Loading products...</p>
        </div>
      </div>
    );
  }

  if (productsData?.totalDocs === 0) {
    return (
      <div className='lg:pt-16 pt-4 lg:px-12'>
        <div className='flex flex-col items-center justify-center border border-black border-dashed gap-y-4 bg-white w-full rounded-lg p-8'>
          <InfoIcon className='size-10 text-gray-500' />
          <p className='text-base font-medium'>No products in cart</p>
        </div>
      </div>
    );
  }

  const products = productsData?.docs;
  const totalPrice =
    products?.reduce((acc, product) => acc + product.price, 0) ?? 0;

  return (
    <div className='lg:pt-16 pt-4 lg:px-12'>
      <div className='grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16'>
        <div className='lg:col-span-4'>
          <div className='border h-full rounded-md overflow-hidden bg-white'>
            {products?.map((product, index) => (
              <CheckoutItem
                key={product.id}
                isLast={index === products.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantUrl(tenantSlug)}/products/${product.id}`}
                tenantUrl={generateTenantUrl(tenantSlug)}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProductFromCart(tenantSlug, product.id)}
              />
            ))}
          </div>
        </div>
        <div className='lg:col-span-3'>
          <CheckoutSidebar
            totalPrice={totalPrice}
            onCheckout={() => {}}
            isCanceled={false}
            isPending={false}
          />
        </div>
      </div>
    </div>
  );
}
