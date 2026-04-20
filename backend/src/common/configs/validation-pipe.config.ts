import { ValidationPipeOptions } from '@nestjs/common';

/**
 * Validation Pipe configuration
 * - whitelist: strip non-decorated properties from the input
 * - forbidNonWhitelisted: throw an error if non-decorated properties are present
 * - transform: automatically transform payloads to be objects typed according to their DTO classes
 */
export const validationPipeConfig: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
};
