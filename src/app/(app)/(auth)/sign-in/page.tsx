import SignInView from '@/modules/auth/ui/views/sign-in-view';
import { Navbar } from '@/app/(app)/(home)/navbar';
import { caller } from '@/trpc/server';
import { redirect } from 'next/navigation';

export default async function SignIn() {
  const session = await caller.auth.session();

  if (session?.user) {
    redirect('/');
  }
  return (
    <>
      <Navbar isAuthPage={true} />
      <SignInView />
    </>
  );
}
