import crypto from 'node:crypto';
import { config } from '../../config/env';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

export class CryptoUtil {
  private static getKey(): Buffer {
    const key = config.app.encryptionKey || '';
    // Use SHA-256 to ensure the key is exactly 32 bytes
    return crypto.createHash('sha256').update(key).digest();
  }

  /**
   * Encrypts a string using AES-256-CBC
   * Returns a string in the format: "iv:encryptedContent" (hex)
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.getKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts a string formatted as "iv:encryptedContent"
   */
  static decrypt(encryptedText: string): string {
    const [ivHex, encryptedContent] = encryptedText.split(':');
    
    if (!ivHex || !encryptedContent) {
      throw new Error('Invalid encrypted text format. Expected "iv:content"');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.getKey(), iv);
    
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
