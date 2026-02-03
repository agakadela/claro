import { getQueryClient, trpc } from '@/trpc/server';
import {
  ProductDetailView,
  ProductDetailViewSkeleton,
} from '@/modules/products/ui/views/product-view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getOne.queryOptions({ id: productId, tenantSlug: slug })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductDetailViewSkeleton />}>
        <ProductDetailView tenantSlug={slug} productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
}
