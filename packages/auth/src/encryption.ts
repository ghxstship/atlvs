import crypto from 'crypto';

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-cbc',
  keyLength: 32,
  ivLength: 16,
};

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  // If key is provided as hex string, convert it
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }

  // If key is provided as base64, convert it
  if (key.length === 44 && /^[0-9a-fA-F+/=]+$/.test(key)) {
    return Buffer.from(key, 'base64');
  }

  // Otherwise, derive key from the string
  return crypto.scryptSync(key, 'salt', ENCRYPTION_CONFIG.keyLength);
}

export interface EncryptedData {
  encrypted: string; // Base64 encoded
  iv: string; // Base64 encoded
}

/**
 * Encrypt sensitive data
 */
export function encryptData(plainText: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);

  const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    encrypted,
    iv: iv.toString('base64'),
  };
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: EncryptedData): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');

  const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);

  let decrypted = decipher.update(Buffer.from(encryptedData.encrypted, 'base64'), undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt data for database storage (combined format)
 */
export function encryptForDatabase(plainText: string): string {
  const encrypted = encryptData(plainText);
  // Store as JSON string in database
  return JSON.stringify(encrypted);
}

/**
 * Decrypt data from database storage
 */
export function decryptFromDatabase(encryptedText: string): string {
  try {
    const encrypted: EncryptedData = JSON.parse(encryptedText);
    return decryptData(encrypted);
  } catch (error) {
    throw new Error('Failed to decrypt data: invalid format');
  }
}

/**
 * Hash sensitive data (one-way - for passwords, etc.)
 */
export function hashData(data: string, saltRounds: number = 12): string {
  // Use scrypt for password hashing (more secure than bcrypt)
  const salt = crypto.randomBytes(32);
  const hash = crypto.scryptSync(data, salt, 64);

  return `${salt.toString('base64')}:${hash.toString('base64')}`;
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hashedData: string): boolean {
  try {
    const [saltBase64, hashBase64] = hashedData.split(':');
    const salt = Buffer.from(saltBase64, 'base64');
    const originalHash = Buffer.from(hashBase64, 'base64');

    const computedHash = crypto.scryptSync(data, salt, 64);

    return crypto.timingSafeEqual(originalHash, computedHash);
  } catch (error) {
    return false;
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure backup code
 */
export function generateBackupCode(): string {
  // Generate 8-digit numeric code
  const code = Math.floor(10000000 + Math.random() * 90000000);
  return code.toString();
}

/**
 * Generate multiple backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateBackupCode());
  }
  return codes;
}
