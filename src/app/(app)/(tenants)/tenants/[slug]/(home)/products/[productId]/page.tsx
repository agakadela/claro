import { getQueryClient, trpc } from '@/trpc/server';
import { ProductDetailView } from '@/modules/products/ui/views/product-view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({ slug }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailView tenantSlug={slug} productId={productId} />
    </HydrationBoundary>
  );
}
