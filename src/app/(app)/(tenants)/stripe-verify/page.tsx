'use client';

import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { Loader2 } from 'lucide-react';

export default function StripeVerifyPage() {
  const trpc = useTRPC();
  const { mutate: verify } = useMutation(
    trpc.checkout.verify.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: () => {
        window.location.href = '/';
      },
    }),
  );

  useEffect(() => {
    verify();
  }, [verify]);
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Loader2 className='size-10 animate-spin' />
      <p className='text-lg font-medium'>Verifying your account...</p>
    </div>
  );
}
