'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import { useTRPC } from '@/trpc/client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarPicker } from '@/components/star-picker';

import { ReviewsGetOneOutput } from '@/modules/reviews/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SparklesIcon } from 'lucide-react';
import { ReviewDraft } from '@/modules/reviews/schemas';

const reviewSchema = z.object({
  description: z
    .string()
    .min(1, {
      message:
        'Description is required and must be between 1 and 1000 characters',
    })
    .max(1000),
  rating: z
    .number()
    .min(1, { message: 'Rating is required and must be between 1 and 5' })
    .max(5),
});

export function ReviewForm({
  productId,
  initialReview,
}: {
  productId: string;
  initialReview: ReviewsGetOneOutput | null;
}) {
  const [isPreview, setIsPreview] = useState(!!initialReview);
  const [reviewId, setReviewId] = useState<string | null>(
    initialReview?.id ?? null,
  );
  const [pendingDraft, setPendingDraft] = useState<ReviewDraft | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      description: initialReview?.description ?? '',
      rating: initialReview?.rating ?? 0,
    },
  });

  function applyDraft(draft: ReviewDraft) {
    form.setValue('description', draft.description);
    form.setValue('rating', draft.rating);
    setPendingDraft(null);
  }

  const createReviewMutation = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: (data) => {
        setReviewId(data.id);
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId }),
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const generateDraftMutation = useMutation(
    trpc.reviews.generateReviewDraft.mutationOptions({
      onSuccess: (draft) => {
        const currentDescription = form.getValues('description');
        if (currentDescription.trim()) {
          setPendingDraft(draft);
        } else {
          applyDraft(draft);
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const updateReviewMutation = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId }),
        );
        setReviewId(data.id);
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  function onSubmit(values: z.infer<typeof reviewSchema>) {
    if (reviewId) {
      updateReviewMutation.mutate({
        reviewId,
        description: values.description,
        rating: values.rating,
      });
    } else {
      createReviewMutation.mutate({
        productId,
        description: values.description,
        rating: values.rating,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-y-4'
      >
        <p className='font-medium'>
          {isPreview ? 'Your rating:' : 'Like this product? Leave a review!'}
        </p>
        <FormField
          control={form.control}
          name='rating'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <StarPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPreview}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Write your review here...'
                  disabled={isPreview}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isPreview && (
          <div className='flex flex-col gap-y-3'>
            {process.env.NEXT_PUBLIC_FEATURE_AI_REVIEW_HELPER === 'true' && (
              <Button
                type='button'
                variant='outline'
                size='lg'
                className='w-fit'
                disabled={generateDraftMutation.isPending}
                onClick={() => generateDraftMutation.mutate({ productId })}
              >
                <SparklesIcon className='size-4' />
                {generateDraftMutation.isPending ? 'Generating...' : 'AI Help'}
              </Button>
            )}
            {pendingDraft && (
              <div className='rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm'>
                <p className='font-medium text-yellow-800'>
                  This will replace your current draft.
                </p>
                <div className='mt-2 flex gap-2'>
                  <Button
                    type='button'
                    size='sm'
                    variant='elevated'
                    className='bg-black text-white hover:bg-pink-400 hover:text-primary'
                    onClick={() => applyDraft(pendingDraft)}
                  >
                    Apply
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => setPendingDraft(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <Button
              type='submit'
              variant='elevated'
              disabled={
                createReviewMutation.isPending ||
                updateReviewMutation.isPending ||
                generateDraftMutation.isPending ||
                form.formState.isSubmitting
              }
              size='lg'
              className='bg-black text-white hover:bg-pink-400 hover:text-primary w-fit'
            >
              {reviewId ? 'Update your review' : 'Submit your review'}
            </Button>
          </div>
        )}
      </form>
      {isPreview && (
        <Button
          type='button'
          variant='elevated'
          size='lg'
          className='w-fit mt-4'
          onClick={() => setIsPreview(false)}
        >
          Edit your review
        </Button>
      )}
    </Form>
  );
}

export function ReviewFormSkeleton() {
  return (
    <div className='flex flex-col gap-y-4'>
      <p className='font-medium'>Like this product? Leave a review!</p>
      <StarPicker disabled />
      <Textarea placeholder='Write your review here...' disabled />
      <Button
        type='button'
        variant='elevated'
        disabled
        size='lg'
        className='bg-black text-white hover:bg-pink-400 hover:text-primary w-fit'
      >
        Submit your review
      </Button>
    </div>
  );
}
