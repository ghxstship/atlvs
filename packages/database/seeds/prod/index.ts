/**
 * Production Seed Data
 * 
 * CAUTION: Only essential data for production initialization
 */

export {}; // Make this file a module

// Production seeds are disabled - no Prisma client instantiation
// Uncomment when production seed logic is needed:
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const prisma: any = {
  $disconnect: async () => {},
};

async function main() {
  console.log('🚀 Seeding production database...');

  // Only essential production data
  // - System settings
  // - Default roles/permissions
  // - Required configurations
  
  console.log('✅ Production seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Production seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
