/**
 * Development Seed Data
 * 
 * Seeds database with development/demo data including:
 * - Demo organizations
 * - Demo users
 * - Sample projects
 * - Test data
 */

import { PrismaClient } from '@prisma/client';

export {}; // Make this file a module

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding development database...');

  // Clear existing data (optional - be careful!)
  // await prisma.user.deleteMany();
  // await prisma.organization.deleteMany();

  // Create demo organization
  /*
  const org = await prisma.organization.upsert({
    where: { slug: 'ghxstship-demo' },
    update: {},
    create: {
      name: 'GHXSTSHIP Demo',
      slug: 'ghxstship-demo',
      // Add other required fields based on your schema
    },
  });

  console.log('✅ Created demo organization:', org.slug);
  */

  // TODO: Uncomment when organization table is added to schema
  // const org = await prisma.organization.upsert({
  //   where: { slug: 'ghxstship-demo' },
  //   update: {},
  //   create: {
  //     name: 'GHXSTSHIP Demo',
  //     slug: 'ghxstship-demo',
  //     // Add other required fields based on your schema
  //   },
  // });
  //
  // console.log('✅ Created demo organization:', org.slug);

  // Create demo users
  // Add your user seeding logic here

  // Create sample projects
  // Add your project seeding logic here

  console.log('✅ Development seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
