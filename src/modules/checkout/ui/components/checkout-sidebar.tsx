import { Button } from '@/components/ui/button';
import { formatAsCurrency } from '@/modules/products/ui/components/price-filter';
import { CircleXIcon, Loader2 } from 'lucide-react';

interface CheckoutSidebarProps {
  totalPrice: number;
  onCheckout: () => void;
  isCanceled: boolean;
  isPending: boolean;
}

export function CheckoutSidebar({
  totalPrice,
  onCheckout,
  isCanceled,
  isPending,
}: CheckoutSidebarProps) {
  return (
    <div className='border rounded-md overflow-hidden bg-white flex flex-col'>
      <div className='flex items-center justify-between p-4 border-b'>
        <h4 className='font-medium text-lg'>Total price</h4>
        <p className='font-medium text-lg'>{formatAsCurrency(totalPrice)}</p>
      </div>
      <div className='p-4 flex items-center justify-center'>
        <Button
          variant='elevated'
          disabled={isPending}
          onClick={onCheckout}
          size='lg'
          className='text-base w-full text-white bg-primary hover:bg-pink-400 hover:text-primary'
        >
          {isPending ? <Loader2 className='size-4 animate-spin' /> : 'Checkout'}
        </Button>
      </div>
      {isCanceled && (
        <div className='p-4 flex items-center justify-center border-t'>
          <div className='flex items-center bg-red-100 border border-red-200 rounded px-4 font-medium py-3'>
            <div className='flex items-center w-full'>
              <CircleXIcon className='size-6 mr-2 fill-red-500 text-red-100' />
              <span> Order canceled, please try again.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
