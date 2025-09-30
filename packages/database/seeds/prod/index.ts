/**
 * Production Seed Data
 * 
 * CAUTION: Only essential data for production initialization
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
