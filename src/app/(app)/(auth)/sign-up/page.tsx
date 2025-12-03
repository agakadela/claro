import SignUpView from '@/modules/auth/ui/views/sign-up-view';
import { Navbar } from '@/modules/home/ui/components/navbar';
import { caller } from '@/trpc/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

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
