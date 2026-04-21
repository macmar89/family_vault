import * as crypto from 'crypto';

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const SYMMETRIC_ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts the raw derivedKey for safe storage in a cookie.
 * SECURITY MEANING: We must encrypt the derivedKey so that even if an attacker steals the cookie,
 * they cannot use the raw AES key without the server's SESSION_SECRET.
 */
export const encryptKeyForCookie = (key: Buffer): string => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is missing');

  // Ensure session secret is 32 bytes for aes-256 by hashing it if necessary,
  // but typically it should be a strong 32-byte string.
  const keyBuffer = crypto.createHash('sha256').update(secret).digest();

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(SYMMETRIC_ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(key);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedKey (base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
};

export const decryptKeyFromCookie = (encryptedCookieValue: string): Buffer => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is missing');

  const keyBuffer = crypto.createHash('sha256').update(secret).digest();
  const parts = encryptedCookieValue.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted cookie format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encryptedKey = Buffer.from(parts[2], 'base64');

  const decipher = crypto.createDecipheriv(SYMMETRIC_ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedKey);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
};
