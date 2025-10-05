/**
 * Test Seed Data
 * 
 * Minimal seed data for testing
 */

import type { PrismaClient } from '@prisma/client';
const PrismaClient = null as any;

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Seeding test database...');

  // Add minimal test data
  
  console.log('✅ Test seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Test seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
