import { CookieSerializeOptions } from '@fastify/cookie';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'AccessToken',
  REFRESH_TOKEN: 'RefreshToken',
} as const;

export const COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 5 * 60,
  } satisfies CookieSerializeOptions,
  
  REFRESH_TOKEN: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days matching JWT expiration
  } satisfies CookieSerializeOptions,
};
