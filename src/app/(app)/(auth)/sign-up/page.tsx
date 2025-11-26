import SignUpView from '@/modules/auth/ui/views/sign-up-view';
import { Navbar } from '@/app/(app)/(home)/navbar';
import { caller } from '@/trpc/server';
import { redirect } from 'next/navigation';

export default async function SignUp() {
  const session = await caller.auth.session();

  if (session?.user) {
    redirect('/');
  }
  return (
    <>
      <Navbar isAuthPage={true} />
      <SignUpView />
    </>
  );
}
