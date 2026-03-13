import { cookies as getCookies } from 'next/headers';
import { AUTH_TOKEN_MAX_AGE } from './constants';

interface GenerateAuthCookieProps {
  prefix: string;
  value: string;
}

export async function generateAuthCookie({
  prefix,
  value,
}: GenerateAuthCookieProps) {
  const cookies = await getCookies();
  cookies.set({
    name: `${prefix}-token`,
    value,
    httpOnly: true,
    maxAge: AUTH_TOKEN_MAX_AGE,
    path: '/',
    sameSite: 'none',
    domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    secure: process.env.NODE_ENV === 'production',
  });
}
