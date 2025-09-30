// Client-safe exports
export * from './supabase';

// Permission system (client-safe)
export { PermissionChecker } from './permission-checker';
export type { PermissionCheckResult } from './permission-checker';
export { UserRole, Permission, PERMISSION_MATRIX } from './permission-matrix';
export { getPermissionCache, PermissionCacheService } from './permission-cache';
export type { PermissionCache, CacheEntry } from './permission-cache';

// Encryption utilities (client-safe)
export { encryptData, decryptData, encryptForDatabase, decryptFromDatabase, hashData, verifyHash, generateSecureToken, generateBackupCode, generateBackupCodes } from './encryption';
export type { EncryptedData } from './encryption';

// Server-only exports are in ./server
// Import from '@ghxstship/auth/server' for server-side code
