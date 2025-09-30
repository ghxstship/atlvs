import crypto from 'crypto';

// Abstract KMS interface
export interface KeyManagementService {
  encrypt(keyId: string, plaintext: Buffer): Promise<Buffer>;
  decrypt(keyId: string, ciphertext: Buffer): Promise<Buffer>;
  generateKey(alias?: string): Promise<string>;
  describeKey(keyId: string): Promise<KeyMetadata>;
  listKeys(): Promise<KeyMetadata[]>;
  deleteKey(keyId: string): Promise<void>;
}

export interface KeyMetadata {
  keyId: string;
  alias?: string;
  algorithm: string;
  keyState: 'enabled' | 'disabled' | 'pending_deletion';
  createdAt: Date;
  description?: string;
}

// AWS KMS Implementation
export class AWSKMSService implements KeyManagementService {
  private kmsClient: any;

  constructor(kmsClient?: any) {
    if (kmsClient) {
      this.kmsClient = kmsClient;
    } else if (process.env.AWS_KMS_ENABLED === 'true') {
      try {
        // Dynamic import to avoid AWS SDK dependency in non-AWS environments
        const { KMSClient } = require('@aws-sdk/client-kms');
        this.kmsClient = new KMSClient({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });
      } catch (error) {
        console.error('Failed to initialize AWS KMS client:', error);
        throw new Error('AWS KMS not available');
      }
    }
  }

  async encrypt(keyId: string, plaintext: Buffer): Promise<Buffer> {
    if (!this.kmsClient) throw new Error('AWS KMS not configured');

    const { EncryptCommand } = require('@aws-sdk/client-kms');
    const command = new EncryptCommand({
      KeyId: keyId,
      Plaintext: plaintext,
    });

    const response = await this.kmsClient.send(command);
    return Buffer.from(response.CiphertextBlob);
  }

  async decrypt(keyId: string, ciphertext: Buffer): Promise<Buffer> {
    if (!this.kmsClient) throw new Error('AWS KMS not configured');

    const { DecryptCommand } = require('@aws-sdk/client-kms');
    const command = new DecryptCommand({
      KeyId: keyId,
      CiphertextBlob: ciphertext,
    });

    const response = await this.kmsClient.send(command);
    return Buffer.from(response.Plaintext);
  }

  async generateKey(alias?: string): Promise<string> {
    if (!this.kmsClient) throw new Error('AWS KMS not configured');

    const { CreateKeyCommand } = require('@aws-sdk/client-kms');
    const command = new CreateKeyCommand({
      Description: `JWT Key for GHXSTSHIP${alias ? ` - ${alias}` : ''}`,
      KeyUsage: 'ENCRYPT_DECRYPT',
      KeySpec: 'AES_256',
      Origin: 'AWS_KMS',
    });

    const response = await this.kmsClient.send(command);

    if (alias) {
      const { CreateAliasCommand } = require('@aws-sdk/client-kms');
      const aliasCommand = new CreateAliasCommand({
        AliasName: `alias/${alias}`,
        TargetKeyId: response.KeyMetadata.KeyId,
      });
      await this.kmsClient.send(aliasCommand);
    }

    return response.KeyMetadata.KeyId;
  }

  async describeKey(keyId: string): Promise<KeyMetadata> {
    if (!this.kmsClient) throw new Error('AWS KMS not configured');

    const { DescribeKeyCommand } = require('@aws-sdk/client-kms');
    const command = new DescribeKeyCommand({ KeyId: keyId });
    const response = await this.kmsClient.send(command);

    const metadata = response.KeyMetadata;
    return {
      keyId: metadata.KeyId,
      alias: metadata.Aliases?.[0]?.AliasName,
      algorithm: metadata.KeySpec || metadata.EncryptionAlgorithms?.[0] || 'AES_256',
      keyState: metadata.KeyState.toLowerCase(),
      createdAt: new Date(metadata.CreationDate),
      description: metadata.Description,
    };
  }

  async listKeys(): Promise<KeyMetadata[]> {
    if (!this.kmsClient) throw new Error('AWS KMS not configured');

    const { ListKeysCommand } = require('@aws-sdk/client-kms');
    const command = new ListKeysCommand({});
    const response = await this.kmsClient.send(command);

    const keys: KeyMetadata[] = [];
    for (const key of response.Keys || []) {
      try {
        keys.push(await this.describeKey(key.KeyId));
      } catch (error) {
        console.warn(`Failed to describe key ${key.KeyId}:`, error);
      }
    }

    return keys;
  }

  async deleteKey(keyId: string): Promise<void> {
    if (!this.kmsClient) throw new Error('AWS KMS not configured');

    const { ScheduleKeyDeletionCommand } = require('@aws-sdk/client-kms');
    const command = new ScheduleKeyDeletionCommand({
      KeyId: keyId,
      PendingWindowInDays: 30, // AWS default
    });

    await this.kmsClient.send(command);
  }
}

// HashiCorp Vault Implementation
export class VaultKMSService implements KeyManagementService {
  private vaultClient: any;
  private transitEnginePath: string;

  constructor(vaultClient?: any, transitEnginePath: string = 'transit') {
    this.transitEnginePath = transitEnginePath;

    if (vaultClient) {
      this.vaultClient = vaultClient;
    } else if (process.env.VAULT_ENABLED === 'true') {
      try {
        const vault = require('node-vault');
        this.vaultClient = vault({
          apiVersion: 'v1',
          endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
          token: process.env.VAULT_TOKEN,
        });
      } catch (error) {
        console.error('Failed to initialize Vault client:', error);
        throw new Error('HashiCorp Vault not available');
      }
    }
  }

  async encrypt(keyId: string, plaintext: Buffer): Promise<Buffer> {
    if (!this.vaultClient) throw new Error('Vault KMS not configured');

    const response = await this.vaultClient.encryptData({
      name: keyId,
      plaintext: plaintext.toString('base64'),
    }, this.transitEnginePath);

    return Buffer.from(response.data.ciphertext, 'base64');
  }

  async decrypt(keyId: string, ciphertext: Buffer): Promise<Buffer> {
    if (!this.vaultClient) throw new Error('Vault KMS not configured');

    const response = await this.vaultClient.decryptData({
      name: keyId,
      ciphertext: ciphertext.toString('base64'),
    }, this.transitEnginePath);

    return Buffer.from(response.data.plaintext, 'base64');
  }

  async generateKey(alias?: string): Promise<string> {
    if (!this.vaultClient) throw new Error('Vault KMS not configured');

    const keyName = alias || `jwt-key-${Date.now()}`;
    await this.vaultClient.createKey({
      name: keyName,
      type: 'aes256-gcm96',
    }, this.transitEnginePath);

    return keyName;
  }

  async describeKey(keyId: string): Promise<KeyMetadata> {
    if (!this.vaultClient) throw new Error('Vault KMS not configured');

    const response = await this.vaultClient.readKey({
      name: keyId,
    }, this.transitEnginePath);

    const keyData = response.data;
    return {
      keyId,
      algorithm: keyData.type,
      keyState: 'enabled', // Vault doesn't expose key state directly
      createdAt: new Date(keyData.creation_time),
      description: `Vault key: ${keyId}`,
    };
  }

  async listKeys(): Promise<KeyMetadata[]> {
    if (!this.vaultClient) throw new Error('Vault KMS not configured');

    const response = await this.vaultClient.listKeys({}, this.transitEnginePath);
    const keys: KeyMetadata[] = [];

    for (const keyName of response.data.keys || []) {
      try {
        keys.push(await this.describeKey(keyName));
      } catch (error) {
        console.warn(`Failed to describe Vault key ${keyName}:`, error);
      }
    }

    return keys;
  }

  async deleteKey(keyId: string): Promise<void> {
    if (!this.vaultClient) throw new Error('Vault KMS not configured');

    await this.vaultClient.deleteKey({
      name: keyId,
    }, this.transitEnginePath);
  }
}

// Local encryption fallback (for development/testing)
export class LocalKMSEncryptionService implements KeyManagementService {
  private masterKey: Buffer;
  private algorithm = 'aes-256-gcm';

  constructor() {
    // Use a derived key from environment or generate one
    const keySource = process.env.KMS_MASTER_KEY || 'ghxstship-local-kms-key';
    this.masterKey = crypto.scryptSync(keySource, 'salt', 32);
  }

  async encrypt(keyId: string, plaintext: Buffer): Promise<Buffer> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.masterKey);

    let encrypted = cipher.update(plaintext);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Prepend IV for decryption
    return Buffer.concat([iv, encrypted]);
  }

  async decrypt(keyId: string, ciphertext: Buffer): Promise<Buffer> {
    const iv = ciphertext.slice(0, 16);
    const encrypted = ciphertext.slice(16);

    const decipher = crypto.createDecipher(this.algorithm, this.masterKey);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  async generateKey(alias?: string): Promise<string> {
    return `local-key-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  async describeKey(keyId: string): Promise<KeyMetadata> {
    return {
      keyId,
      algorithm: this.algorithm,
      keyState: 'enabled',
      createdAt: new Date(),
      description: 'Local KMS key (development only)',
    };
  }

  async listKeys(): Promise<KeyMetadata[]> {
    // Local service doesn't maintain a key registry
    return [];
  }

  async deleteKey(keyId: string): Promise<void> {
    // No-op for local service
  }
}

// Factory function to create appropriate KMS service
export function createKMSService(): KeyManagementService {
  if (process.env.AWS_KMS_ENABLED === 'true') {
    return new AWSKMSService();
  } else if (process.env.VAULT_ENABLED === 'true') {
    return new VaultKMSService();
  } else {
    console.warn('No production KMS configured, using local encryption (development only)');
    return new LocalKMSEncryptionService();
  }
}
