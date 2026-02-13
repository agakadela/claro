import { Button } from '@/components/ui/button';
import { useCart } from '@/modules/checkout/hooks/use-cart';
import { ShoppingCartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CartButton({
  tenantSlug,
  productId,
}: {
  tenantSlug: string;
  productId: string;
}) {
  const cart = useCart(tenantSlug);

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
