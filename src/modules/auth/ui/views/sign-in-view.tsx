'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/modules/auth/schemas';

export default function SignInView() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const loginMutation = useMutation(
    trpc.auth.login.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.auth.session.queryKey(),
        });
        router.push('/');
      },
    })
  );

  const form = useForm<z.infer<typeof loginSchema>>({
    mode: 'all',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <div className='relative grid grid-cols-1 lg:grid-cols-4 overflow-hidden h-[calc(100vh-80px)]'>
      <div className='lg:col-span-2 flex justify-center items-center w-full'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-8 p-4 lg:p-16 w-full max-w-xl'
          >
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='text-base border-none underline'
            >
              <Link href='/sign-up' className='text-base underline'>
                Create account
              </Link>
            </Button>
            <h1 className='text-4xl font-medium'>
              Join over 2500 creators and start selling on Claro
            </h1>
            <div className='flex flex-col gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base'>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type='email' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base'>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type='password' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                variant='elevated'
                className='bg-black text-white hover:bg-pink-400 hover:text-primary'
                disabled={loginMutation.isPending}
              >
                Log in
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className='hidden lg:flex lg:col-span-2 relative overflow-hidden bg-linear-to-br from-pink-400 via-yellow-300 to-cyan-400'>
        <div className='absolute inset-0'>
          <div className='absolute -top-20 -right-20 w-80 h-80 rounded-full bg-black/10 border-4 border-black' />

          <div className='absolute top-1/4 left-10 w-40 h-40 bg-white border-4 border-black rotate-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)]' />
          <div className='absolute top-1/3 left-20 w-32 h-32 bg-pink-500 border-4 border-black -rotate-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]' />

          <div className='absolute bottom-20 right-20 w-48 h-24 bg-cyan-500 border-4 border-black rotate-3 shadow-[8px_8px_0_0_rgba(0,0,0,1)]' />
          <div className='absolute bottom-40 left-1/3 w-24 h-24 bg-yellow-400 border-4 border-black rounded-full shadow-[6px_6px_0_0_rgba(0,0,0,1)]' />

          <div className='absolute top-1/2 left-0 right-0 h-1 bg-black/20 -rotate-12' />
          <div className='absolute top-2/3 left-0 right-0 h-1 bg-black/20 rotate-6' />
        </div>

        <div className='relative z-10 flex flex-col items-center justify-center w-full h-full p-8'>
          <div className='bg-white border-4 border-black p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] rotate-2 hover:rotate-0 transition-transform'>
            <span className='text-6xl xl:text-7xl font-black tracking-tighter'>
              CLARO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
