'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ReviewForm } from '@/modules/library/ui/components/review-form';

export function ReviewSidebar({ productId }: { productId: string }) {
  const trpc = useTRPC();
  const { data: review } = useSuspenseQuery(
    trpc.reviews.getOne.queryOptions({ productId }),
  );

  return <ReviewForm productId={productId} initialReview={review} />;
}
