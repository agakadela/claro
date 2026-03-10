'use client';

import { TriangleAlertIcon } from 'lucide-react';

export default function ProductErrorPage() {
  return (
    <div className='px-4 lg:px-12 py-10'>
      <div className='border border-black border-dashed flex items-center justify-center gap-y-4 bg-white w-full rounded-lg p-8'>
        <TriangleAlertIcon className='size-10 text-red-500' />
        <p className='text-base font-medium'>Failed to load product</p>
        <p className='text-sm text-gray-500'>Please try refreshing the page</p>
      </div>
    </div>
  );
}
