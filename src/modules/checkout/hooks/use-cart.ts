import { useCartStore } from '../store/use-cart-store';

export function useCart(tenantSlug: string) {
  const { addProductToCart, removeProductFromCart, clearCart, clearAllCarts } =
    useCartStore();

  const productIds = useCartStore(
    (state) => state.tenantCarts[tenantSlug]?.productIds ?? [],
  );

  const toggleProductInCart = (productId: string) => {
    if (productIds.includes(productId)) {
      removeProductFromCart(tenantSlug, productId);
    } else {
      addProductToCart(tenantSlug, productId);
    }
  };

  const isProductInCart = (productId: string) => {
    return productIds.includes(productId);
  };

  const clearTenantCart = () => {
    clearCart(tenantSlug);
  };

  return {
    productIds,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProductInCart,
    isProductInCart,
    totalItemsInCart: productIds.length,
  };
}
