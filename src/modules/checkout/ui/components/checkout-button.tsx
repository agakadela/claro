import { Button } from '@/components/ui/button';
import { useCart } from '../../hooks/use-cart';
import { cn, generateTenantUrl } from '@/lib/utils';
import Link from 'next/link';
import { ShoppingCartIcon } from 'lucide-react';

interface CheckoutButtonProps {
  className?: string;
  tenantSlug: string;
  hideWhenEmpty?: boolean;
}

export function CheckoutButton({
  className,
  tenantSlug,
  hideWhenEmpty,
}: CheckoutButtonProps) {
  const { totalItemsInCart } = useCart(tenantSlug);

  if (hideWhenEmpty && totalItemsInCart === 0) {
    return null;
  }

  return (
    <Button variant='elevated' asChild className={cn(className, 'bg-white')}>
      <Link href={`${generateTenantUrl(tenantSlug)}/checkout`}>
        <ShoppingCartIcon /> {totalItemsInCart > 0 ? totalItemsInCart : ''}
      </Link>
    </Button>
  );
}
