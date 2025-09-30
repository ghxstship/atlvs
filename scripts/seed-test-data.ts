#!/usr/bin/env tsx

/**
 * Test Data Seeding Script for GHXSTSHIP
 * Creates consistent test data across all modules for reliable testing
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedTestData() {
  console.log('🌱 Starting test data seeding...');

  try {
    // Clean existing test data
    await cleanTestData();

    // Seed organizations
    const orgs = await seedOrganizations();

    // Seed users and memberships
    const users = await seedUsersAndMemberships(orgs);

    // Seed modules data
    await seedProjects(orgs);
    await seedFinanceData(orgs);
    await seedPeopleData(orgs);
    await seedCompaniesData(orgs);
    await seedProcurementData(orgs);
    await seedJobsData(orgs);
    await seedSettingsData(orgs);

    console.log('✅ Test data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Test data seeding failed:', error);
    process.exit(1);
  }
}

async function cleanTestData() {
  console.log('🧹 Cleaning existing test data...');

  // Delete in reverse dependency order
  await supabase.from('job_bids').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('job_compliance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('opportunities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('procurement_tracking').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('procurement_approvals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('procurement_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('procurement_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('procurement_vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('company_ratings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('company_qualifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('company_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('company_contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('people').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('budgets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('memberships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

async function seedOrganizations() {
  console.log('🏢 Seeding organizations...');

  const organizations = [
    {
      id: 'test-org-1',
      name: 'Test Organization 1',
      slug: 'test-org-1',
      description: 'Primary test organization',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'test-org-2',
      name: 'Test Organization 2',
      slug: 'test-org-2',
      description: 'Secondary test organization',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { data, error } = await supabase
    .from('organizations')
    .insert(organizations)
    .select();

  if (error) throw error;
  return data;
}

async function seedUsersAndMemberships(orgs: any[]) {
  console.log('👥 Seeding users and memberships...');

  // Create test users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const { data: user } = await supabase.auth.admin.createUser({
      email: `test-user-${i}@example.com`,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        name: faker.person.fullName(),
        avatar_url: faker.image.avatar(),
      },
    });
    users.push(user.user);
  }

  // Create memberships
  const memberships = [];
  users.forEach((user, index) => {
    const org = orgs[index % orgs.length];
    const roles = ['owner', 'admin', 'manager', 'member', 'viewer'];
    const role = roles[index % roles.length];

    memberships.push({
      user_id: user!.id,
      organization_id: org.id,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  const { error } = await supabase
    .from('memberships')
    .insert(memberships);

  if (error) throw error;
  return users;
}

async function seedProjects(orgs: any[]) {
  console.log('📁 Seeding projects...');

  const projects = [];
  const statuses = ['active', 'completed', 'on-hold', 'cancelled'];

  for (let i = 1; i <= 20; i++) {
    projects.push({
      name: faker.company.name() + ' Project',
      description: faker.lorem.paragraph(),
      status: statuses[i % statuses.length],
      organization_id: orgs[i % orgs.length].id,
      created_at: faker.date.past().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const { error } = await supabase
    .from('projects')
    .insert(projects);

  if (error) throw error;
}

async function seedFinanceData(orgs: any[]) {
  console.log('💰 Seeding finance data...');

  // Seed budgets
  const budgets = [];
  const categories = ['equipment', 'construction', 'catering', 'travel', 'marketing', 'operations'];

  for (let i = 1; i <= 15; i++) {
    budgets.push({
      name: faker.commerce.productName() + ' Budget',
      description: faker.lorem.sentence(),
      amount: faker.number.float({ min: 1000, max: 50000 }),
      spent: faker.number.float({ min: 0, max: 30000 }),
      currency: 'USD',
      category: categories[i % categories.length],
      status: i % 3 === 0 ? 'completed' : 'active',
      organization_id: orgs[i % orgs.length].id,
      period_start: faker.date.past().toISOString(),
      period_end: faker.date.future().toISOString(),
      created_at: faker.date.past().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  await supabase.from('budgets').insert(budgets);

  // Seed expenses
  const expenses = [];
  const expenseCategories = ['equipment', 'construction', 'catering', 'travel', 'office', 'professional-services'];

  for (let i = 1; i <= 50; i++) {
    expenses.push({
      description: faker.commerce.productName(),
      amount: faker.number.float({ min: 10, max: 5000 }),
      currency: 'USD',
      category: expenseCategories[i % expenseCategories.length],
      status: i % 5 === 0 ? 'approved' : i % 3 === 0 ? 'submitted' : 'draft',
      organization_id: orgs[i % orgs.length].id,
      expense_date: faker.date.recent().toISOString(),
      created_at: faker.date.past().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  await supabase.from('expenses').insert(expenses);
}

async function seedPeopleData(orgs: any[]) {
  console.log('👥 Seeding people data...');

  const people = [];
  const departments = ['engineering', 'design', 'marketing', 'sales', 'hr', 'finance', 'operations'];
  const roles = ['developer', 'designer', 'manager', 'analyst', 'specialist', 'coordinator'];

  for (let i = 1; i <= 25; i++) {
    people.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar_url: faker.image.avatar(),
      department: departments[i % departments.length],
      role: roles[i % roles.length],
      status: i % 4 === 0 ? 'inactive' : 'active',
      organization_id: orgs[i % orgs.length].id,
      hire_date: faker.date.past({ years: 5 }).toISOString(),
      created_at: faker.date.past().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const { error } = await supabase
    .from('people')
    .insert(people);

  if (error) throw error;
}

async function seedCompaniesData(orgs: any[]) {
  console.log('🏢 Seeding companies data...');

  const companies = [];
  const industries = ['technology', 'construction', 'manufacturing', 'consulting', 'retail', 'healthcare'];

  for (let i = 1; i <= 15; i++) {
    companies.push({
      name: faker.company.name(),
      description: faker.company.buzzPhrase(),
      industry: industries[i % industries.length],
      website: faker.internet.url(),
      status: i % 3 === 0 ? 'inactive' : 'active',
      organization_id: orgs[i % orgs.length].id,
      founded_year: faker.number.int({ min: 1980, max: 2020 }),
      employee_count: faker.number.int({ min: 1, max: 10000 }),
      created_at: faker.date.past().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const { error } = await supabase
    .from('companies')
    .insert(companies);

  if (error) throw error;
}

async function seedProcurementData(orgs: any[]) {
  console.log('📦 Seeding procurement data...');

  // Seed vendors
  const vendors = [];
  for (let i = 1; i <= 10; i++) {
    vendors.push({
      name: faker.company.name(),
      contact_email: faker.internet.email(),
      contact_phone: faker.phone.number(),
      status: i % 3 === 0 ? 'inactive' : 'active',
      organization_id: orgs[i % orgs.length].id,
      created_at: faker.date.past().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  await supabase.from('procurement_vendors').insert(vendors);

  // Additional procurement seeding would go here
}

async function seedJobsData(orgs: any[]) {
  console.log('💼 Seeding jobs data...');

  // Seed jobs
  const jobs = [];
  const jobTypes = ['full-time', 'part-time', 'contract', 'freelance'];

  for (let i = 1; i <= 12; i++) {
    jobs.push({
      title: faker.person.jobTitle(),
      description: faker.lorem.paragraphs(2),
      type: jobTypes[i % jobTypes.length],
      status: i % 4 === 0 ? 'filled' : i % 3 === 0 ? 'cancelled' : 'open',
      organization_id: orgs[i % orgs.length].id,
      budget_min: faker.number.float({ min: 30000, max: 80000 }),
      budget_max: faker.number.float({ min: 80000, max: 150000 }),
      created_at: faker.date.past().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const { error } = await supabase
    .from('jobs')
    .insert(jobs);

  if (error) throw error;

  // Seed opportunities and bids would go here
}

async function seedSettingsData(orgs: any[]) {
  console.log('⚙️ Seeding settings data...');

  // Additional settings seeding would go here
  // This would include organization settings, team invites, etc.
}

// Run the seeding script
if (require.main === module) {
  seedTestData();
}

export { seedTestData };
