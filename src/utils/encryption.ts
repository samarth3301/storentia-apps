import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

export function encrypt(plaintext: string, keyHex: string): EncryptedData {
  const key = Buffer.from(keyHex, 'hex');
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decrypt(data: EncryptedData, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(data.iv, 'base64');
  const tag = Buffer.from(data.tag, 'base64');
  const encryptedBuf = Buffer.from(data.encrypted, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encryptedBuf), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptObject(obj: Record<string, any>, keyHex: string): EncryptedData {
  return encrypt(JSON.stringify(obj), keyHex);
}

export function decryptObject<T = Record<string, any>>(data: EncryptedData, keyHex: string): T {
  return JSON.parse(decrypt(data, keyHex)) as T;
}
