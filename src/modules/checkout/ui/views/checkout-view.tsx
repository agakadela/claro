'use client';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../../hooks/use-cart';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { CheckoutItem } from '../components/checkout-item';
import { generateTenantUrl } from '@/lib/utils';
import { CheckoutSidebar } from '../components/checkout-sidebar';
import { InfoIcon, Loader2 } from 'lucide-react';
import { useCheckoutStates } from '../../hooks/use-checkout-states';
import { useRouter } from 'next/navigation';

export function CheckoutView({ tenantSlug }: { tenantSlug: string }) {
  const [states, setStates] = useCheckoutStates();
  const { productIds, removeProduct, clearCart } = useCart(tenantSlug);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({
          success: false,
          cancel: false,
        });
      },
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (error) => {
        if (error.data?.code === 'UNAUTHORIZED') {
          router.push('/auth/sign-in');
          // TODO: modify when subdomains are implemented
        }
        toast.error(error.message);
      },
    }),
  );

  useEffect(() => {
    if (states.success) {
      setStates({
        success: false,
        cancel: false,
      });
      clearCart();
      queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());
      router.push('/library');
    }
  }, [states.success, clearCart, router, setStates, trpc.library.getMany]);

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
        removeProduct(id);
      });

      toast.error(
        invalidIds.length > 0
          ? `${invalidIds.length} product${invalidIds.length > 1 ? 's' : ''} removed from cart`
          : 'Some products are no longer available',
      );
    }
  }, [error, removeProduct]);

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

  if (
    error &&
    error.data?.code !== 'NOT_FOUND' &&
    error.data?.code !== 'FORBIDDEN'
  ) {
    return (
      <div className='lg:pt-16 pt-4 lg:px-12'>
        <div className='flex flex-col items-center justify-center border border-black border-dashed gap-y-4 bg-white w-full rounded-lg p-8'>
          <InfoIcon className='size-10 text-red-500' />
          <p className='text-base font-medium'>Failed to load cart</p>
          <p className='text-sm text-gray-500'>
            Please try refreshing the page
          </p>
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
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>
        <div className='lg:col-span-3'>
          <CheckoutSidebar
            totalPrice={totalPrice}
            onPurchase={() => {
              purchase.mutate({
                productIds,
                tenantSlug,
              });
            }}
            isCanceled={states.cancel}
            isPending={purchase.isPending}
          />
        </div>
      </div>
    </div>
  );
}
