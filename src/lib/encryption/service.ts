// lib/encryption/service.ts
import CryptoJS from 'crypto-js';

// A real production app would use a more robust secret management system,
// but for this prototype, we'll rely on environment variables.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-super-secret-key-that-is-long-enough';
if (ENCRYPTION_KEY === 'default-super-secret-key-that-is-long-enough') {
    console.warn("Warning: Using default encryption key. Set ENCRYPTION_KEY in your environment for production.");
}


export class EncryptionService {
  private key: string;

  constructor() {
    this.key = ENCRYPTION_KEY;
  }

  /**
   * Encrypts a JSON object.
   * @param data - The JSON object to encrypt.
   * @returns A base64-encoded encrypted string.
   */
  encrypt(data: any): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.key).toString();
  }

  /**
   * Decrypts a string back into a JSON object.
   * @param encryptedData - The base64-encoded encrypted string.
   * @returns The original JSON object.
   */
  decrypt(encryptedData: string): any {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) {
            throw new Error("Decryption resulted in an empty string. The key may be incorrect or the data corrupted.");
        }
        return JSON.parse(decrypted);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null; // Return null or handle the error as appropriate
    }
  }

  /**
   * Hashes a password using SHA256. This is for demonstration;
   * production systems should use a secure, salted hashing algorithm like bcrypt or Argon2.
   * @param password The password to hash.
   * @returns A SHA256 hash of the password.
   */
  hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }
}

export const encryptionService = new EncryptionService();
