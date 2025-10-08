/**
 * Test Seed Data
 * 
 * Minimal seed data for testing
 */

export {}; // Make this file a module

// Test seeds are disabled - no Prisma client instantiation
// Uncomment when test seed logic is needed:
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const prisma: any = {
  $disconnect: async () => {},
};

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
