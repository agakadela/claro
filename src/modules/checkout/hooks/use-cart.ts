import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCartStore } from '../store/use-cart-store';

export function useCart(tenantSlug: string) {
  const addProductToCart = useCartStore((state) => state.addProductToCart);
  const removeProductFromCart = useCartStore(
    (state) => state.removeProductFromCart,
  );
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);

  const productIds = useCartStore(
    useShallow((state) => state.tenantCarts[tenantSlug]?.productIds ?? []),
  );

  const addProduct = useCallback(
    (productId: string) => addProductToCart(tenantSlug, productId),
    [addProductToCart, tenantSlug],
  );

  const removeProduct = useCallback(
    (productId: string) => removeProductFromCart(tenantSlug, productId),
    [removeProductFromCart, tenantSlug],
  );

  const clearTenantCart = useCallback(
    () => clearCart(tenantSlug),
    [clearCart, tenantSlug],
  );

  const toggleProductInCart = useCallback(
    (productId: string) => {
      const currentIds =
        useCartStore.getState().tenantCarts[tenantSlug]?.productIds ?? [];
      if (currentIds.includes(productId)) {
        removeProduct(productId);
      } else {
        addProduct(productId);
      }
    },
    [tenantSlug, addProduct, removeProduct],
  );

  const isProductInCart = (productId: string) => productIds.includes(productId);

  return {
    productIds,
    totalItemsInCart: productIds.length,
    addProduct,
    removeProduct,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProductInCart,
    isProductInCart,
  };
}
