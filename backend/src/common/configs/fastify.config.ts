import { FastifyAdapter } from '@nestjs/platform-fastify';

/**
 * Fastify Adapter configuration
 * - logger: enables/disables internal logger
 * - trustProxy: required for accurate IP tracking when behind a reverse proxy
 * - bodyLimit: limits the size of the request body (50KB default for security)
 */
export const fastifyAdapter = new FastifyAdapter({
  logger: true,
  trustProxy: true,
  bodyLimit: 51200, // 50 KB
});
