import SignInView from '@/modules/auth/ui/views/sign-in-view';
import { Navbar } from '@/app/(app)/(home)/navbar';

export default function SignIn() {
  return (
    <>
      <Navbar isAuth={true} />
      <SignInView />
    </>
  );
}
