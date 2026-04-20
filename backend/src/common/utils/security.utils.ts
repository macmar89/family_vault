import * as argon2 from 'argon2';

/**
 * Hashes a plain text password using Argon2id with settings from environment variables.
 * Defaults follow modern security best practices (64MB memory, 3 iterations, 4 parallelism).
 */
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: Number(process.env.ARGON2_MEMORY) || 131072,
    timeCost: Number(process.env.ARGON2_TIME) || 4,
    parallelism: Number(process.env.ARGON2_PARALLELISM) || 4,
  });
};

/**
 * Verifies a plain text password against a hashed Argon2id password.
 */
export const verifyPassword = async (hashed: string, plain: string): Promise<boolean> => {
  return argon2.verify(hashed, plain);
};
