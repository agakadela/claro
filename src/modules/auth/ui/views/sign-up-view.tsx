'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { registerSchema } from '@/modules/auth/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SignUpView() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions({
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

  const form = useForm<z.infer<typeof registerSchema>>({
    mode: 'all',
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate(values);
  }

  const username = form.watch('username');
  const usernameError = form.formState.errors.username;
  const showPreview = username && !usernameError;

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
              <Link href='/sign-in' className='text-base underline'>
                Sign in
              </Link>
            </Button>
            <h1 className='text-4xl font-medium'>
              Join over 2500 creators and start selling on Claro
            </h1>
            <div className='flex flex-col gap-4'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base'>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription
                      className={cn('hidden', showPreview && 'block')}
                    >
                      Your store will be visible at https://
                      <strong>{username}</strong>.claro.com
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                disabled={registerMutation.isPending}
              >
                Create account
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className='hidden lg:flex lg:col-span-2 relative overflow-hidden bg-linear-to-br from-cyan-400 via-pink-400 to-yellow-300'>
        <div className='absolute inset-0'>
          <div className='absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-black/10 border-4 border-black' />

          <div className='absolute top-20 right-10 w-40 h-40 bg-white border-4 border-black -rotate-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)]' />
          <div className='absolute top-32 right-24 w-32 h-32 bg-yellow-400 border-4 border-black rotate-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]' />

          <div className='absolute bottom-32 left-10 w-48 h-24 bg-pink-500 border-4 border-black -rotate-3 shadow-[8px_8px_0_0_rgba(0,0,0,1)]' />
          <div className='absolute top-1/2 right-1/4 w-24 h-24 bg-cyan-500 border-4 border-black rounded-full shadow-[6px_6px_0_0_rgba(0,0,0,1)]' />

          <div className='absolute top-1/3 left-0 right-0 h-1 bg-black/20 rotate-12' />
          <div className='absolute top-1/2 left-0 right-0 h-1 bg-black/20 -rotate-6' />
        </div>

        <div className='relative z-10 flex flex-col items-center justify-center w-full h-full p-8'>
          <div className='bg-white border-4 border-black p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] -rotate-2 hover:rotate-0 transition-transform'>
            <span className='text-6xl xl:text-7xl font-black tracking-tighter'>
              CLARO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
