import { Button } from '@/components/ui/button';
import { useCart } from '@/modules/checkout/hooks/use-cart';
import { ShoppingCartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CartButtonProps {
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
}

export function CartButton({
  tenantSlug,
  productId,
  isPurchased,
}: CartButtonProps) {
  const cart = useCart(tenantSlug);

  if (isPurchased) {
    return (
      <Button
        variant='elevated'
        asChild
        className='flex-1 font-medium bg-white'
      >
        <Link href={`/library/${productId}`}>View in Library</Link>
      </Button>
    );
  }

  return (
    <Button
      variant='elevated'
      className={cn(
        'flex-1 bg-pink-400',
        cart.isProductInCart(productId) && 'bg-white',
      )}
      onClick={() => cart.toggleProductInCart(productId)}
    >
      <ShoppingCartIcon className='size-4' />
      <span className='text-sm font-medium'>
        {cart.isProductInCart(productId) ? 'Remove from cart' : 'Add to cart'}
      </span>
    </Button>
  );
}
