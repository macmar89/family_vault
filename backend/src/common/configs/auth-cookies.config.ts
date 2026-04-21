import { CookieSerializeOptions } from '@fastify/cookie';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'AccessToken',
  REFRESH_TOKEN: 'RefreshToken',
  VAULT_KEY: 'VaultKey',
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

  VAULT_KEY: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    signed: true,
    path: '/',
    // It's up to you if this aligns with access token or refresh token expiration.
    // Usually vault session exists as long as refresh token exists or just access token session.
    // Let's stick with 7 days to match refresh token for seamless experience.
    maxAge: 7 * 24 * 60 * 60,
  } satisfies CookieSerializeOptions,
};
