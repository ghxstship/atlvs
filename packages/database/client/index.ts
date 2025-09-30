/**
 * GHXSTSHIP Database Client
 * 
 * Singleton Prisma client instance with proper configuration for
 * development and production environments.
 */

import { PrismaClient } from '@prisma/client';

// Extend PrismaClient with custom methods if needed
export interface DatabaseClient extends PrismaClient {
  // Add custom methods here
}

// Singleton instance
declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Database client configuration
 */
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: process.env.NODE_ENV === 'development' 
      ? 'pretty' 
      : 'minimal',
  });
};

/**
 * Get or create database client
 */
export const db = global.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = db;
}

/**
 * Graceful shutdown
 */
export const disconnectDatabase = async (): Promise<void> => {
  await db.$disconnect();
};

/**
 * Health check
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Re-export Prisma types and utilities
 */
export * from '@prisma/client';
export type { Prisma } from '@prisma/client';

/**
 * Transaction helper
 */
export const transaction = db.$transaction.bind(db);

/**
 * Extend client with custom methods
 */
export const extendClient = <T>(
  client: PrismaClient,
  extensions: T
): PrismaClient & T => {
  return Object.assign(client, extensions);
};

export default db;
