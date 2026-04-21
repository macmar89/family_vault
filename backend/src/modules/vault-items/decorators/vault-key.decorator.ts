import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { COOKIE_NAMES } from '../../../common/configs/auth-cookies.config';
import { decryptKeyFromCookie } from '../../../common/utils/crypto.utils';

export const VaultKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Buffer => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    
    // We expect the vault key fastify signed cookie or raw cookie depending on how simple we set it.
    // Wait, in auth.controller.ts, we used res.setCookie with signed: true config, so it's a signed cookie.
    // However, fastify exposes unsigned values in req.cookies if they are verified.
    const encryptedKey = request.cookies[COOKIE_NAMES.VAULT_KEY];

    if (!encryptedKey) {
      throw new UnauthorizedException('Vault key not found in session');
    }

    try {
      // Return the raw 32-byte Buffer key
      return decryptKeyFromCookie(encryptedKey);
    } catch (error) {
      throw new UnauthorizedException('Invalid or tampered vault session key');
    }
  },
);
