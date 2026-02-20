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

  const trpc = useTRPC();
  const queryClient = useQueryClient();

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

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      description: initialReview?.description ?? '',
      rating: initialReview?.rating ?? 0,
    },
  });

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
          <Button
            type='submit'
            variant='elevated'
            disabled={
              createReviewMutation.isPending ||
              updateReviewMutation.isPending ||
              form.formState.isSubmitting
            }
            size='lg'
            className='bg-black text-white hover:bg-pink-400 hover:text-primary w-fit'
          >
            {reviewId ? 'Update your review' : 'Submit your review'}
          </Button>
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
