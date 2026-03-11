'use client';

import { TriangleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='px-4 lg:px-12 py-10'>
      <div className='border border-black border-dashed flex flex-col items-center justify-center gap-y-4 bg-white w-full rounded-lg p-8'>
        <TriangleAlertIcon className='size-10 text-red-500' />
        <p className='text-base font-medium'>Failed to load product</p>
        <p className='text-sm text-gray-500'>
          Something went wrong. You can try again or refresh the page.
        </p>
        <Button variant='elevated' size='lg' onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
