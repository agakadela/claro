import SignUpView from '@/modules/auth/ui/views/sign-up-view';
import { Navbar } from '@/app/(app)/(home)/navbar';

export default function SignUp() {
  return (
    <>
      <Navbar isAuth={true} />
      <SignUpView />
    </>
  );
}
