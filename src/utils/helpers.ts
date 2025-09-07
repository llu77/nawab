
import CryptoJS from 'crypto-js';

// utils/helpers.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US').format(date);
}

/**
 * Generates a cryptographically secure random token.
 * @param length - The desired length of the token.
 * @returns A secure random token as a hex string.
 */
export function generateSecureToken(length: number = 32): string {
  const randomBytes = CryptoJS.lib.WordArray.random(length);
  return randomBytes.toString(CryptoJS.enc.Hex);
}
