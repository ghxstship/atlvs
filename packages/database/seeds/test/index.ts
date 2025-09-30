/**
 * Test Seed Data
 * 
 * Minimal seed data for testing
 */

import { PrismaClient } from '@prisma/client';

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
