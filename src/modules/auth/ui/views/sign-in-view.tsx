'use client';

import Image from 'next/image';
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
    <div className='relative grid grid-cols-1 lg:grid-cols-4 overflow-hidden'>
      <div className='lg:col-span-2 flex justify-center items-center w-full h-full'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-8 p-4 lg:p-16 w-full '
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
      <div className='hidden overflow-hidden lg:block h-[90vh] w-full lg:col-span-2'>
        <div className='absolute top-1/2 -right-40 -translate-y-1/2 lg:w-[80vw] xl:w-[70vw]'>
          <Image
            className='w-full h-auto'
            src='/bg.svg'
            width={1349}
            height={1216}
            alt='Background pattern'
            priority
          />
        </div>

        <div className='absolute top-1/2 -right-30 -translate-y-1/2 w-[80vw] lg:w-[70vw] xl:w-[60vw] z-2'>
          <Image
            className='w-full h-auto'
            src='/mockup-light.png'
            width={989}
            height={862}
            alt='Product mockup'
            priority
          />
        </div>
      </div>
    </div>
  );
}
