import { Button, Link } from '@payloadcms/ui';

export function StripeVerify() {
  return (
    <Link href={'/stripe-verify'}>
      <Button>Verify Account</Button>
    </Link>
  );
}
