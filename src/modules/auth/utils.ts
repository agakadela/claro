import { cookies as getCookies } from 'next/headers';
import { AUTH_TOKEN_MAX_AGE } from './constants';

interface GenerateAuthCookieProps {
  prefix: string;
  value: string;
}

export function getAuthCookieOptions() {
  const options: {
    path: string;
    sameSite: 'lax' | 'none';
    secure: boolean;
    maxAge: number;
    domain?: string;
  } = {
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_TOKEN_MAX_AGE,
  };
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    options.domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  }
  return options;
}

export async function generateAuthCookie({
  prefix,
  value,
}: GenerateAuthCookieProps) {
  const cookies = await getCookies();
  const options = getAuthCookieOptions();
  cookies.set({
    name: `${prefix}-token`,
    value,
    httpOnly: true,
    maxAge: options.maxAge,
    path: '/',
    sameSite: options.sameSite,
    domain: options.domain,
    secure: options.secure,
  });
}
