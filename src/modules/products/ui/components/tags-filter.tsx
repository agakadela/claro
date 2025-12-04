'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { useTRPC } from '@/trpc/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DEFAULT_TAGS_LIMIT } from '@/modules/tags/constants';
import { ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TagsFilterProps {
  tags?: string[] | null;
  onTagsChange: (tags: string[]) => void;
}

export function TagsFilter({ tags, onTagsChange }: TagsFilterProps) {
  const trpc = useTRPC();
  const {
    data: tagData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.tags.getMany.infiniteQueryOptions(
      { limit: DEFAULT_TAGS_LIMIT },
      {
        getNextPageParam: (lastPage) =>
          lastPage.docs.length > 0 ? lastPage.nextPage : undefined,
      }
    )
  );

  function handleTagClick(tagName: string) {
    if (tags?.includes(tagName)) {
      onTagsChange(tags?.filter((tag) => tag !== tagName) || []);
    } else {
      onTagsChange([...(tags || []), tagName]);
    }
  }

  return (
    <div className='flex flex-col gap-y-2'>
      {isLoading ? (
        <div className='flex items-center justify-center p-4'>
          <Loader2 className='size-4 animate-spin' />
        </div>
      ) : (
        tagData?.pages.map((page) =>
          page.docs.map((tag) => (
            <div
              key={tag.id}
              className='flex items-center justify-between cursor-pointer'
              onClick={() => handleTagClick(tag.name)}
            >
              <p className='font-medium text-base'>{tag.name}</p>
              <Checkbox
                checked={tags?.includes(tag.name)}
                onCheckedChange={() => handleTagClick(tag.name)}
              />
            </div>
          ))
        )
      )}
      {hasNextPage && (
        <Button variant='link' type='button' onClick={() => fetchNextPage()}>
          <p className='font-medium text-base'>Load more</p>
          <ArrowDown className='size-4' />
        </Button>
      )}
    </div>
  );
}
