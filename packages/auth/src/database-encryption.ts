import crypto from 'crypto';
import { createKMSService, KeyManagementService } from './kms-service';

function isCipherGCM(cipher: crypto.Cipher): cipher is crypto.CipherGCM {
  return typeof (cipher as crypto.CipherGCM).getAuthTag === 'function';
}

function isDecipherGCM(decipher: crypto.Decipher): decipher is crypto.DecipherGCM {
  return typeof (decipher as crypto.DecipherGCM).setAuthTag === 'function';
}

export interface EncryptionConfig {
  algorithm: 'aes-256-gcm' | 'aes-256-cbc';
  keyId: string;
  keySize: number;
}

export interface EncryptedData {
  encrypted: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  tag?: string; // Base64 encoded authentication tag (for GCM)
  keyId: string; // ID of the key used for encryption
}

// Default encryption configuration
const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyId: 'database-encryption-key',
  keySize: 32, // 256 bits
};

/**
 * Database encryption service for encrypting sensitive data at rest
 */
export class DatabaseEncryptionService {
  private kmsService: KeyManagementService;
  private config: EncryptionConfig;

  constructor(config: Partial<EncryptionConfig> = {}) {
    this.config = { ...DEFAULT_ENCRYPTION_CONFIG, ...config };
    this.kmsService = createKMSService();
  }

  /**
   * Encrypt sensitive data before storing in database
   */
  async encryptData(plaintext: string): Promise<EncryptedData> {
    try {
      // Generate a random IV for each encryption
      const ivLength = this.config.algorithm === 'aes-256-gcm' ? 12 : 16;
      const iv = crypto.randomBytes(ivLength);

      // Get encryption key from KMS
      const keyBuffer = await this.getEncryptionKey();

      // Create cipher
      const cipher = crypto.createCipheriv(this.config.algorithm, keyBuffer, iv);

      // Encrypt the data
      const encryptedBuffer = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
      const encrypted = encryptedBuffer.toString('base64');

      const result: EncryptedData = {
        encrypted,
        iv: iv.toString('base64'),
        keyId: this.config.keyId,
      };

      // Add authentication tag for GCM mode
      if (this.config.algorithm === 'aes-256-gcm' && isCipherGCM(cipher)) {
        result.tag = cipher.getAuthTag().toString('base64');
      }

      return result;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt data retrieved from database
   */
  async decryptData(encryptedData: EncryptedData): Promise<string> {
    try {
      // Get decryption key from KMS
      const keyBuffer = await this.getEncryptionKey();

      // Decode encrypted data and IV
      const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
      const iv = Buffer.from(encryptedData.iv, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(this.config.algorithm, keyBuffer, iv);

      // Set authentication tag for GCM mode
      if (this.config.algorithm === 'aes-256-gcm' && encryptedData.tag && isDecipherGCM(decipher)) {
        const tag = Buffer.from(encryptedData.tag, 'base64');
        decipher.setAuthTag(tag);
      }

      // Decrypt the data
      const decryptedBuffer = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      const decrypted = decryptedBuffer.toString('utf8');

      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Get or create encryption key from KMS
   */
  private async getEncryptionKey(): Promise<Buffer> {
    try {
      // Try to get existing key from KMS
      const keys = await this.kmsService.listKeys();
      const existingKey = keys.find(k => k.keyId === this.config.keyId);

      if (existingKey) {
        // Generate a derived key from the KMS key ID for database encryption
        // In production, you might want to store the actual encrypted key
        return this.deriveKeyFromId(this.config.keyId);
      } else {
        // Generate a new key for database encryption
        // In production, this should be stored securely
        return this.deriveKeyFromId(this.config.keyId);
      }
    } catch (error) {
      console.warn('KMS not available, falling back to derived key:', error);
      // Fallback to derived key for development
      return this.deriveKeyFromId(this.config.keyId);
    }
  }

  private deriveKeyFromId(keyId: string): Buffer {
    const derived = crypto.scryptSync(keyId, 'salt', this.config.keySize);
    return Buffer.from(derived.subarray(0, this.config.keySize));
  }

  /**
   * Encrypt a specific field value
   */
  async encryptField(fieldName: string, value: string): Promise<string> {
    if (!value || value.trim() === '') {
      return value; // Don't encrypt empty values
    }

    const encrypted = await this.encryptData(value);
    // Store as JSON string in database
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt a specific field value
   */
  async decryptField(fieldName: string, encryptedValue: string): Promise<string> {
    if (!encryptedValue || encryptedValue.trim() === '') {
      return encryptedValue; // Don't decrypt empty values
    }

    try {
      const encryptedData: EncryptedData = JSON.parse(encryptedValue);
      return await this.decryptData(encryptedData);
    } catch (error) {
      console.error(`Failed to decrypt field ${fieldName}:`, error);
      throw new Error(`Field decryption failed for ${fieldName}`);
    }
  }

  /**
   * Check if a field value is encrypted
   */
  isEncrypted(value: string): boolean {
    if (!value || value.trim() === '') {
      return false;
    }

    try {
      const parsed = JSON.parse(value);
      return !!(parsed.encrypted && parsed.iv && parsed.keyId);
    } catch {
      return false;
    }
  }
}

// Sensitive fields that should be encrypted
export const SENSITIVE_FIELDS = {
  users: ['ssn', 'tax_id', 'bank_account', 'credit_card'],
  organizations: ['tax_id', 'bank_account', 'api_keys'],
  people: ['ssn', 'emergency_contacts', 'medical_info'],
  companies: ['tax_id', 'financial_data', 'bank_details'],
  finance: ['account_numbers', 'routing_numbers', 'card_details'],
  procurement: ['payment_info', 'vendor_credentials'],
  settings: ['api_keys', 'webhook_secrets', 'encryption_keys'],
  // Add more tables and fields as needed
};

// Encryption utility functions for database operations
export class DatabaseEncryptionHelper {
  private encryptionService: DatabaseEncryptionService;

  constructor() {
    this.encryptionService = new DatabaseEncryptionService();
  }

  /**
   * Encrypt sensitive fields in data object before database insertion/update
   */
  async encryptSensitiveFields(tableName: string, data: Record<string, any>): Promise<Record<string, any>> {
    const encryptedData = { ...data };
    const sensitiveFields = SENSITIVE_FIELDS[tableName as keyof typeof SENSITIVE_FIELDS] || [];

    for (const field of sensitiveFields) {
      if (encryptedData[field] !== undefined && !this.encryptionService.isEncrypted(encryptedData[field])) {
        encryptedData[field] = await this.encryptionService.encryptField(field, String(encryptedData[field]));
      }
    }

    return encryptedData;
  }

  /**
   * Decrypt sensitive fields in data object after database retrieval
   */
  async decryptSensitiveFields(tableName: string, data: Record<string, any>): Promise<Record<string, any>> {
    const decryptedData = { ...data };
    const sensitiveFields = SENSITIVE_FIELDS[tableName as keyof typeof SENSITIVE_FIELDS] || [];

    for (const field of sensitiveFields) {
      if (decryptedData[field] !== undefined && this.encryptionService.isEncrypted(decryptedData[field])) {
        decryptedData[field] = await this.encryptionService.decryptField(field, decryptedData[field]);
      }
    }

    return decryptedData;
  }

  /**
   * Encrypt sensitive fields in array of data objects
   */
  async encryptSensitiveFieldsBatch(tableName: string, dataArray: Record<string, any>[]): Promise<Record<string, any>[]> {
    return Promise.all(dataArray.map(data => this.encryptSensitiveFields(tableName, data)));
  }

  /**
   * Decrypt sensitive fields in array of data objects
   */
  async decryptSensitiveFieldsBatch(tableName: string, dataArray: Record<string, any>[]): Promise<Record<string, any>[]> {
    return Promise.all(dataArray.map(data => this.decryptSensitiveFields(tableName, data)));
  }
}

// Singleton instances
let databaseEncryptionService: DatabaseEncryptionService | null = null;
let databaseEncryptionHelper: DatabaseEncryptionHelper | null = null;

export function getDatabaseEncryptionService(): DatabaseEncryptionService {
  if (!databaseEncryptionService) {
    databaseEncryptionService = new DatabaseEncryptionService();
  }
  return databaseEncryptionService;
}

export function getDatabaseEncryptionHelper(): DatabaseEncryptionHelper {
  if (!databaseEncryptionHelper) {
    databaseEncryptionHelper = new DatabaseEncryptionHelper();
  }
  return databaseEncryptionHelper;
}
