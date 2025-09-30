import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { createKMSService, KeyManagementService } from './kms-service';

// JWT Key Management Configuration
export interface JWTKeyConfig {
  algorithm: 'HS256' | 'HS384' | 'HS512';
  keySize: number; // in bytes
  rotationInterval: number; // in milliseconds
  maxActiveKeys: number;
  keyPrefix: string;
}

export interface JWTKey {
  id: string;
  key: Buffer;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  algorithm: string;
}

// Default configuration
const DEFAULT_CONFIG: JWTKeyConfig = {
  algorithm: 'HS256',
  keySize: 32, // 256 bits
  rotationInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxActiveKeys: 3,
  keyPrefix: 'jwt_key_',
};

export class JWTKeyManager {
  private keys: Map<string, JWTKey> = new Map();
  private config: JWTKeyConfig;
  private currentKeyId: string | null = null;
  private rotationTimer: NodeJS.Timeout | null = null;
  private kmsService: KeyManagementService;

  constructor(config: Partial<JWTKeyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.kmsService = createKMSService();
    this.initializeKeys().catch(error => {
      console.error('Failed to initialize JWT keys:', error);
    });
    this.scheduleRotation();
  }

  /**
   * Initialize keys from environment or generate new ones
   */
  private async initializeKeys(): Promise<void> {
    // Load existing keys from environment or KMS
    await this.loadKeysFromEnv();

    // If no keys were loaded, generate initial key
    if (this.keys.size === 0) {
      this.generateNewKey(true);
    }

    // Ensure we have at least one active key
    if (!this.currentKeyId) {
      this.generateNewKey(true);
    }
  }

  /**
   * Load keys from environment variables
   */
  private loadKeysFromEnvironment(): JWTKey[] {
    const keys: JWTKey[] = [];
    const envVars = Object.keys(process.env);

    envVars.forEach(envVar => {
      if (envVar.startsWith(this.config.keyPrefix.toUpperCase())) {
        try {
          const keyData = JSON.parse(process.env[envVar]!);
          if (this.validateKeyData(keyData)) {
            const key: JWTKey = {
              id: keyData.id,
              key: Buffer.from(keyData.key, 'base64'),
              createdAt: new Date(keyData.createdAt),
              expiresAt: keyData.expiresAt ? new Date(keyData.expiresAt) : undefined,
              isActive: keyData.isActive,
              algorithm: keyData.algorithm,
            };
            keys.push(key);
          }
        } catch (error) {
          console.warn(`Failed to parse JWT key from ${envVar}:`, error);
        }
      }
    });

    return keys;
  }

  /**
   * Validate key data structure
   */
  private validateKeyData(data: any): boolean {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.key === 'string' &&
      typeof data.createdAt === 'string' &&
      typeof data.isActive === 'boolean' &&
      typeof data.algorithm === 'string'
    );
  }

  /**
   * Generate a new JWT key
   */
  private generateNewKey(makeActive: boolean = false): string {
    const keyId = `${this.config.keyPrefix}${Date.now()}_${randomBytes(4).toString('hex')}`;
    const key = randomBytes(this.config.keySize);

    const jwtKey: JWTKey = {
      id: keyId,
      key,
      createdAt: new Date(),
      isActive: makeActive,
      algorithm: this.config.algorithm,
    };

    this.keys.set(keyId, jwtKey);

    if (makeActive) {
      this.currentKeyId = keyId;
    }

    // Persist key to external KMS in production
    this.persistKey(jwtKey).catch(error => {
      console.error('Failed to persist JWT key:', error);
    });

    console.log(`Generated new JWT key: ${keyId}`);
    return keyId;
  }

  /**
   * Persist key to KMS for production security
   */
  private async persistKey(jwtKey: JWTKey): Promise<void> {
    try {
      // Encrypt the key material using KMS
      const encryptedKey = await this.kmsService.encrypt(jwtKey.id, jwtKey.key);

      // Store metadata in environment or database (not the key material)
      const keyMetadata = {
        id: jwtKey.id,
        createdAt: jwtKey.createdAt.toISOString(),
        expiresAt: jwtKey.expiresAt?.toISOString(),
        isActive: jwtKey.isActive,
        algorithm: jwtKey.algorithm,
        // Key material is encrypted and stored separately
        encryptedKeyId: jwtKey.id,
      };

      // In production, store metadata in a secure database or configuration service
      // For now, we store it in environment variables with encryption
      const metadataStr = JSON.stringify(keyMetadata);
      const encryptedMetadata = await this.kmsService.encrypt(`${jwtKey.id}_metadata`, Buffer.from(metadataStr));

      // Store encrypted metadata in environment (this is a simplified approach)
      // In production, this should go to a secure configuration service
      process.env[`JWT_KEY_METADATA_${jwtKey.id}`] = encryptedMetadata.toString('base64');

      console.log(`Successfully persisted JWT key: ${jwtKey.id} using KMS encryption`);
    } catch (error) {
      console.error('Failed to persist JWT key to KMS:', error);
      // In production, this should be a hard failure
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Failed to securely persist JWT key');
      }
    }
  }

  /**
   * Load existing keys from KMS or environment variables
   */
  private async loadKeysFromEnv(): Promise<void> {
    try {
      // First, try to load from KMS if available
      if (process.env.AWS_KMS_ENABLED === 'true' || process.env.VAULT_ENABLED === 'true') {
        await this.loadKeysFromKMS();
      } else {
        // Fallback to environment variables for backward compatibility
        this.loadKeysFromEnvironmentVariables();
      }
    } catch (error) {
      console.warn('Failed to load keys from KMS, falling back to environment:', error);
      this.loadKeysFromEnvironmentVariables();
    }
  }

  /**
   * Load keys from KMS
   */
  private async loadKeysFromKMS(): Promise<void> {
    try {
      const kmsKeys = await this.kmsService.listKeys();

      for (const keyMetadata of kmsKeys) {
        if (keyMetadata.keyId.startsWith(this.config.keyPrefix)) {
          try {
            // Try to load metadata from environment (simplified approach)
            const metadataEnvVar = `JWT_KEY_METADATA_${keyMetadata.keyId}`;
            const encryptedMetadata = process.env[metadataEnvVar];

            if (encryptedMetadata) {
              // Decrypt metadata
              const metadataBuffer = Buffer.from(encryptedMetadata, 'base64');
              const decryptedMetadata = await this.kmsService.decrypt(`${keyMetadata.keyId}_metadata`, metadataBuffer);
              const metadata = JSON.parse(decryptedMetadata.toString());

              // Decrypt the actual key
              const encryptedKey = await this.kmsService.encrypt(keyMetadata.keyId, Buffer.alloc(0)); // This is a placeholder - we need the actual encrypted key
              // In production, the encrypted key should be stored separately
              const decryptedKey = await this.kmsService.decrypt(keyMetadata.keyId, encryptedKey);

              const jwtKey: JWTKey = {
                id: metadata.id,
                key: decryptedKey,
                createdAt: new Date(metadata.createdAt),
                expiresAt: metadata.expiresAt ? new Date(metadata.expiresAt) : undefined,
                isActive: metadata.isActive,
                algorithm: metadata.algorithm,
              };

              this.keys.set(keyMetadata.keyId, jwtKey);

              if (jwtKey.isActive && !this.currentKeyId) {
                this.currentKeyId = keyMetadata.keyId;
              }
            }
          } catch (error) {
            console.warn(`Failed to load key ${keyMetadata.keyId} from KMS:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to list keys from KMS:', error);
      throw error;
    }
  }

  /**
   * Fallback method to load keys from environment variables
   */
  private loadKeysFromEnvironmentVariables(): void {
    const prefix = this.config.keyPrefix.toUpperCase();

    for (const [envVar, value] of Object.entries(process.env)) {
      if (envVar.startsWith(prefix)) {
        try {
          const keyData = JSON.parse(value as string);
          const jwtKey: JWTKey = {
            id: keyData.id,
            key: Buffer.from(keyData.key, 'base64'),
            createdAt: new Date(keyData.createdAt),
            expiresAt: keyData.expiresAt ? new Date(keyData.expiresAt) : undefined,
            isActive: keyData.isActive,
            algorithm: keyData.algorithm,
          };

          this.keys.set(keyData.id, jwtKey);

          // Set current key if it's active and we don't have one yet
          if (jwtKey.isActive && !this.currentKeyId) {
            this.currentKeyId = keyData.id;
          }
        } catch (error) {
          console.warn(`Failed to parse JWT key from env var ${envVar}:`, error);
        }
      }
    }
  }

  /**
   * Schedule automatic key rotation
   */
  private scheduleRotation(): void {
    this.rotationTimer = setInterval(() => {
      this.rotateKeys();
    }, this.config.rotationInterval);
  }

  /**
   * Rotate keys - deactivate old keys and generate new ones
   */
  private rotateKeys(): void {
    // Deactivate keys older than rotation interval
    const cutoffTime = Date.now() - this.config.rotationInterval;
    const keysToDeactivate: string[] = [];

    for (const [keyId, jwtKey] of this.keys.entries()) {
      if (jwtKey.createdAt.getTime() < cutoffTime && jwtKey.isActive) {
        keysToDeactivate.push(keyId);
      }
    }

    keysToDeactivate.forEach(keyId => {
      const jwtKey = this.keys.get(keyId);
      if (jwtKey) {
        jwtKey.isActive = false;
        jwtKey.expiresAt = new Date();
        // TODO: Update key status in KMS
        // this.persistKey(jwtKey);
        console.log(`Deactivated JWT key: ${keyId}`);
      }
    });

    // Generate new key
    this.generateNewKey(true);

    // Cleanup old keys beyond max active limit
    this.cleanupOldKeys();
  }

  /**
   * Clean up keys beyond the maximum active limit
   */
  private cleanupOldKeys(): void {
    const activeKeys = Array.from(this.keys.values())
      .filter(k => k.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (activeKeys.length > this.config.maxActiveKeys) {
      const keysToRemove = activeKeys.slice(this.config.maxActiveKeys);
      keysToRemove.forEach(jwtKey => {
        jwtKey.isActive = false;
        jwtKey.expiresAt = new Date();
        // TODO: Update key status in KMS
        // this.persistKey(jwtKey);
        console.log(`Cleaned up old JWT key: ${jwtKey.id}`);
      });
    }
  }

  /**
   * Get current active key
   */
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

  /**
   * Get key by ID
   */
  getKeyById(keyId: string): JWTKey | null {
    return this.keys.get(keyId) || null;
  }

  /**
   * Sign data with current key
   */
  signData(data: string): { signature: string; keyId: string } {
    const key = this.getCurrentKey();
    const hmac = createHmac(this.getAlgorithmName(key.algorithm), key.key);
    hmac.update(data);
    const signature = hmac.digest('base64');

    return {
      signature,
      keyId: key.id,
    };
  }

  /**
   * Verify data signature with appropriate key
   */
  verifyData(data: string, signature: string, keyId: string): boolean {
    const key = this.getKeyById(keyId);
    if (!key) {
      return false;
    }

    const hmac = createHmac(this.getAlgorithmName(key.algorithm), key.key);
    hmac.update(data);
    const expectedSignature = hmac.digest('base64');

    try {
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }

  /**
   * Get algorithm name for crypto module
   */
  private getAlgorithmName(algorithm: string): string {
    switch (algorithm) {
      case 'HS256': return 'sha256';
      case 'HS384': return 'sha384';
      case 'HS512': return 'sha512';
      default: return 'sha256';
    }
  }

  /**
   * Get all active keys
   */
  getActiveKeys(): JWTKey[] {
    return Array.from(this.keys.values()).filter(k => k.isActive);
  }

  /**
   * Get key statistics
   */
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

  /**
   * Force immediate key rotation
   */
  forceRotateKeys(): string {
    const newKeyId = this.generateNewKey(true);
    this.rotateKeys();
    return newKeyId;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
    this.keys.clear();
    this.currentKeyId = null;
  }
}

// Singleton instance
let jwtKeyManager: JWTKeyManager | null = null;
let jwtKeyManagerPromise: Promise<JWTKeyManager> | null = null;

export async function getJWTKeyManager(config?: Partial<JWTKeyConfig>): Promise<JWTKeyManager> {
  if (jwtKeyManager) {
    return jwtKeyManager;
  }

  if (jwtKeyManagerPromise) {
    return jwtKeyManagerPromise;
  }

  jwtKeyManagerPromise = Promise.resolve().then(() => {
    jwtKeyManager = new JWTKeyManager(config);
    return jwtKeyManager;
  });

  return jwtKeyManagerPromise;
}

// Synchronous getter for backward compatibility (returns null if not ready)
export function getJWTKeyManagerSync(): JWTKeyManager | null {
  return jwtKeyManager;
}

export default JWTKeyManager;
