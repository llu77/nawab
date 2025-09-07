// lib/encryption/service.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private key: string;

  constructor() {
    this.key = process.env.ENCRYPTION_KEY!;
    if (!this.key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set.');
    }
  }

  encrypt(data: any): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.key).toString();
  }

  decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  }

  hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }
}

export const encryptionService = new EncryptionService();
