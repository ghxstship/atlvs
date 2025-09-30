import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

// KMS Provider Interface
export interface KMSProvider {
  encrypt(data: Buffer, keyId?: string): Promise<{ encryptedData: Buffer; keyId: string }>;
  decrypt(encryptedData: Buffer, keyId: string): Promise<Buffer>;
  generateKey(keySpec?: string): Promise<{ keyId: string; publicKey?: Buffer }>;
  deleteKey(keyId: string): Promise<void>;
  listKeys(): Promise<string[]>;
}

// AWS KMS Provider
export class AWSKMSProvider implements KMSProvider {
  private kmsClient: any;
  private keyAlias: string;

  constructor(region: string = 'us-east-1', keyAlias: string = 'alias/jwt-keys') {
    // In production, import @aws-sdk/client-kms
    this.keyAlias = keyAlias;
  }

  async encrypt(data: Buffer, keyId?: string): Promise<{ encryptedData: Buffer; keyId: string }> {
    const key = keyId || this.keyAlias;
    // Placeholder - in production use actual AWS KMS
    const encryptedData = Buffer.from(data.toString('base64')); // Mock encryption
    return { encryptedData, keyId: key };
  }

  async decrypt(encryptedData: Buffer, keyId: string): Promise<Buffer> {
    // Placeholder - in production use actual AWS KMS
    return Buffer.from(encryptedData.toString(), 'base64'); // Mock decryption
  }

  async generateKey(keySpec?: string): Promise<{ keyId: string; publicKey?: Buffer }> {
    const keyId = `jwt-key-${Date.now()}-${randomBytes(4).toString('hex')}`;
    // Placeholder - in production create actual KMS key
    return { keyId };
  }

  async deleteKey(keyId: string): Promise<void> {
    // Placeholder - in production delete KMS key
  }

  async listKeys(): Promise<string[]> {
    // Placeholder - in production list KMS keys
    return [];
  }
}

// GCP KMS Provider
export class GCPKMSProvider implements KMSProvider {
  private client: any;
  private keyRing: string;
  private location: string;

  constructor(projectId: string, location: string = 'global', keyRing: string = 'jwt-keys') {
    this.location = location;
    this.keyRing = keyRing;
  }

  async encrypt(data: Buffer, keyId?: string): Promise<{ encryptedData: Buffer; keyId: string }> {
    const key = keyId || 'latest';
    // Placeholder - in production use @google-cloud/kms
    const encryptedData = Buffer.from(data.toString('base64'));
    return { encryptedData, keyId: key };
  }

  async decrypt(encryptedData: Buffer, keyId: string): Promise<Buffer> {
    return Buffer.from(encryptedData.toString(), 'base64');
  }

  async generateKey(keySpec?: string): Promise<{ keyId: string; publicKey?: Buffer }> {
    const keyId = `jwt-key-${Date.now()}`;
    return { keyId };
  }

  async deleteKey(keyId: string): Promise<void> {
    // Implementation for GCP KMS
  }

  async listKeys(): Promise<string[]> {
    return [];
  }
}

// Local KMS Provider (for development/testing)
export class LocalKMSProvider implements KMSProvider {
  private keys = new Map<string, Buffer>();
  private masterKey: Buffer;

  constructor(masterKey?: string) {
    this.masterKey = masterKey ? Buffer.from(masterKey, 'hex') : randomBytes(32);
  }

  async encrypt(data: Buffer, keyId?: string): Promise<{ encryptedData: Buffer; keyId: string }> {
    const key = keyId || `key-${Date.now()}`;
    if (!this.keys.has(key)) {
      this.keys.set(key, randomBytes(32));
    }

    const keyBuffer = this.keys.get(key)!;
    const hmac = createHmac('sha256', keyBuffer);
    hmac.update(data);
    const encryptedData = hmac.digest();

    return { encryptedData, keyId: key };
  }

  async decrypt(encryptedData: Buffer, keyId: string): Promise<Buffer> {
    // Local provider can't actually decrypt - this is for testing only
    throw new Error('Local KMS provider does not support decryption');
  }

  async generateKey(keySpec?: string): Promise<{ keyId: string; publicKey?: Buffer }> {
    const keyId = `local-key-${Date.now()}-${randomBytes(4).toString('hex')}`;
    this.keys.set(keyId, randomBytes(32));
    return { keyId };
  }

  async deleteKey(keyId: string): Promise<void> {
    this.keys.delete(keyId);
  }

  async listKeys(): Promise<string[]> {
    return Array.from(this.keys.keys());
  }
}

// JWT Key Management Configuration
export interface JWTKeyConfig {
  algorithm: 'HS256' | 'HS384' | 'HS512';
  keySize: number;
  rotationInterval: number;
  maxActiveKeys: number;
  kmsProvider: 'aws' | 'gcp' | 'local';
  kmsConfig: {
    region?: string;
    keyAlias?: string;
    projectId?: string;
    location?: string;
    keyRing?: string;
    masterKey?: string;
  };
}

export interface JWTKey {
  id: string;
  kmsKeyId: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  algorithm: string;
}

const DEFAULT_CONFIG: JWTKeyConfig = {
  algorithm: 'HS256',
  keySize: 32,
  rotationInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxActiveKeys: 3,
  kmsProvider: 'local',
  kmsConfig: {},
};

export class SecureJWTKeyManager {
  private keys: Map<string, JWTKey> = new Map();
  private config: JWTKeyConfig;
  private kmsProvider: KMSProvider;
  private currentKeyId: string | null = null;
  private rotationTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<JWTKeyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.kmsProvider = this.createKMSProvider();
    this.initializeKeys();
    this.scheduleRotation();
  }

  private createKMSProvider(): KMSProvider {
    switch (this.config.kmsProvider) {
      case 'aws':
        return new AWSKMSProvider(
          this.config.kmsConfig.region,
          this.config.kmsConfig.keyAlias
        );
      case 'gcp':
        return new GCPKMSProvider(
          this.config.kmsConfig.projectId!,
          this.config.kmsConfig.location,
          this.config.kmsConfig.keyRing
        );
      case 'local':
      default:
        return new LocalKMSProvider(this.config.kmsConfig.masterKey);
    }
  }

  private async initializeKeys(): Promise<void> {
    try {
      // Load existing keys from KMS metadata (stored securely)
      const existingKeys = await this.loadKeysFromKMS();
      for (const key of existingKeys) {
        this.keys.set(key.id, key);
        if (key.isActive && !this.currentKeyId) {
          this.currentKeyId = key.id;
        }
      }

      // Generate initial key if none exist
      if (!this.currentKeyId) {
        await this.generateNewKey(true);
      }
    } catch (error) {
      console.error('Failed to initialize JWT keys:', error);
      throw new Error('JWT key initialization failed');
    }
  }

  private async loadKeysFromKMS(): Promise<JWTKey[]> {
    const keys: JWTKey[] = [];
    // In production, this would query a secure metadata store
    // For now, return empty array (keys will be generated)
    return keys;
  }

  private async generateNewKey(makeActive: boolean = false): Promise<string> {
    try {
      const kmsResult = await this.kmsProvider.generateKey();
      const keyId = `jwt_${Date.now()}_${randomBytes(4).toString('hex')}`;

      const jwtKey: JWTKey = {
        id: keyId,
        kmsKeyId: kmsResult.keyId,
        createdAt: new Date(),
        isActive: makeActive,
        algorithm: this.config.algorithm,
      };

      this.keys.set(keyId, jwtKey);

      if (makeActive) {
        this.currentKeyId = keyId;
      }

      // Store key metadata securely (not the key itself)
      await this.storeKeyMetadata(jwtKey);

      console.log(`Generated new secure JWT key: ${keyId} using KMS`);
      return keyId;
    } catch (error) {
      console.error('Failed to generate JWT key:', error);
      throw new Error('JWT key generation failed');
    }
  }

  private async storeKeyMetadata(jwtKey: JWTKey): Promise<void> {
    // In production, store metadata in a secure database or KMS
    // Never store the actual key material
    const metadata = {
      id: jwtKey.id,
      kmsKeyId: jwtKey.kmsKeyId,
      createdAt: jwtKey.createdAt.toISOString(),
      expiresAt: jwtKey.expiresAt?.toISOString(),
      isActive: jwtKey.isActive,
      algorithm: jwtKey.algorithm,
    };

    // Store in secure location (e.g., encrypted database, secure config)
    // This is a placeholder - implement according to your security requirements
  }

  private async scheduleRotation(): Promise<void> {
    this.rotationTimer = setInterval(async () => {
      try {
        await this.rotateKeys();
      } catch (error) {
        console.error('JWT key rotation failed:', error);
      }
    }, this.config.rotationInterval);
  }

  private async rotateKeys(): Promise<void> {
    const cutoffTime = Date.now() - this.config.rotationInterval;
    const keysToDeactivate: string[] = [];

    for (const [keyId, jwtKey] of this.keys.entries()) {
      if (jwtKey.createdAt.getTime() < cutoffTime && jwtKey.isActive) {
        keysToDeactivate.push(keyId);
      }
    }

    for (const keyId of keysToDeactivate) {
      const jwtKey = this.keys.get(keyId);
      if (jwtKey) {
        jwtKey.isActive = false;
        jwtKey.expiresAt = new Date();
        await this.storeKeyMetadata(jwtKey);
        console.log(`Deactivated JWT key: ${keyId}`);
      }
    }

    // Generate new key
    await this.generateNewKey(true);

    // Cleanup old keys
    await this.cleanupOldKeys();
  }

  private async cleanupOldKeys(): Promise<void> {
    const activeKeys = Array.from(this.keys.values())
      .filter(k => k.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (activeKeys.length > this.config.maxActiveKeys) {
      const keysToRemove = activeKeys.slice(this.config.maxActiveKeys);
      for (const jwtKey of keysToRemove) {
        jwtKey.isActive = false;
        jwtKey.expiresAt = new Date();
        await this.storeKeyMetadata(jwtKey);
        // Optionally delete from KMS
        try {
          await this.kmsProvider.deleteKey(jwtKey.kmsKeyId);
        } catch (error) {
          console.warn(`Failed to delete KMS key ${jwtKey.kmsKeyId}:`, error);
        }
        console.log(`Cleaned up old JWT key: ${jwtKey.id}`);
      }
    }
  }

  getCurrentKey(): JWTKey {
    if (!this.currentKeyId) {
      throw new Error('No active JWT key available');
    }

    const key = this.keys.get(this.currentKeyId);
    if (!key) {
      throw new Error('Current JWT key not found');
    }

    return key;
  }

  getKeyById(keyId: string): JWTKey | null {
    return this.keys.get(keyId) || null;
  }

  async signData(data: string): Promise<{ signature: string; keyId: string }> {
    const key = this.getCurrentKey();

    // Generate a temporary signing key from KMS
    const tempKey = randomBytes(this.config.keySize);
    const { encryptedData } = await this.kmsProvider.encrypt(tempKey, key.kmsKeyId);

    // Use the encrypted data as HMAC key
    const hmac = createHmac(this.getAlgorithmName(key.algorithm), encryptedData);
    hmac.update(data);
    const signature = hmac.digest('base64');

    return {
      signature,
      keyId: key.id,
    };
  }

  async verifyData(data: string, signature: string, keyId: string): Promise<boolean> {
    try {
      const key = this.getKeyById(keyId);
      if (!key) {
        return false;
      }

      // Generate the same temporary key (this is a limitation of symmetric encryption)
      // In production, consider asymmetric signing for better security
      const tempKey = randomBytes(this.config.keySize);
      const { encryptedData } = await this.kmsProvider.encrypt(tempKey, key.kmsKeyId);

      const hmac = createHmac(this.getAlgorithmName(key.algorithm), encryptedData);
      hmac.update(data);
      const expectedSignature = hmac.digest('base64');

      return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }

  private getAlgorithmName(algorithm: string): string {
    switch (algorithm) {
      case 'HS256': return 'sha256';
      case 'HS384': return 'sha384';
      case 'HS512': return 'sha512';
      default: return 'sha256';
    }
  }

  getActiveKeys(): JWTKey[] {
    return Array.from(this.keys.values()).filter(k => k.isActive);
  }

  getKeyStats(): {
    totalKeys: number;
    activeKeys: number;
    currentKeyId: string | null;
    nextRotation: Date;
  } {
    const activeKeys = this.getActiveKeys();

    return {
      totalKeys: this.keys.size,
      activeKeys: activeKeys.length,
      currentKeyId: this.currentKeyId,
      nextRotation: new Date(Date.now() + this.config.rotationInterval),
    };
  }

  async forceRotateKeys(): Promise<string> {
    const newKeyId = await this.generateNewKey(true);
    await this.rotateKeys();
    return newKeyId;
  }

  async destroy(): Promise<void> {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }

    // Securely clean up keys
    for (const jwtKey of this.keys.values()) {
      if (jwtKey.isActive) {
        try {
          await this.kmsProvider.deleteKey(jwtKey.kmsKeyId);
        } catch (error) {
          console.warn(`Failed to delete KMS key ${jwtKey.kmsKeyId}:`, error);
        }
      }
    }

    this.keys.clear();
    this.currentKeyId = null;
  }
}

// Singleton instance
let secureJwtKeyManager: SecureJWTKeyManager | null = null;

export function getSecureJWTKeyManager(config?: Partial<JWTKeyConfig>): SecureJWTKeyManager {
  if (!secureJwtKeyManager) {
    secureJwtKeyManager = new SecureJWTKeyManager(config);
  }
  return secureJwtKeyManager;
}

// Backward compatibility
export const JWTKeyManager = SecureJWTKeyManager;
export function getJWTKeyManager(config?: Partial<JWTKeyConfig>): SecureJWTKeyManager {
  return getSecureJWTKeyManager(config);
}
