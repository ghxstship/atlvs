#!/usr/bin/env node

/**
 * Demo Users Setup Script
 * Creates authenticated demo users for each role type in GHXSTSHIP
 * 
 * Usage: node scripts/setup-demo-users.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const DEMO_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'owner@ghxstship.demo',
    password: 'demo123!',
    full_name: 'Alex Chen (Owner)',
    role: 'owner'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'admin@ghxstship.demo',
    password: 'demo123!',
    full_name: 'Sarah Johnson (Admin)',
    role: 'admin'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'manager@ghxstship.demo',
    password: 'demo123!',
    full_name: 'Mike Rodriguez (Manager)',
    role: 'manager'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'contributor@ghxstship.demo',
    password: 'demo123!',
    full_name: 'Emma Thompson (Contributor)',
    role: 'contributor'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'viewer@ghxstship.demo',
    password: 'demo123!',
    full_name: 'David Park (Viewer)',
    role: 'viewer'
  }
]

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001'

async function createDemoOrganization() {
  console.log('📋 Creating demo organization...')
  
  const { data, error } = await supabase
    .from('organizations')
    .upsert({
      id: DEMO_ORG_ID,
      name: 'GHXSTSHIP Demo Org',
      slug: 'ghxstship-demo'
    })
    .select()

  if (error && error.code !== '23505') {
    throw new Error(`Failed to create demo organization: ${error.message}`)
  }
  
  console.log('✅ Demo organization created/updated')
  return data
}

async function createDemoUser(demoUser) {
  console.log(`👤 Creating demo user: ${demoUser.email}`)
  
  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: demoUser.full_name
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⚠️  User ${demoUser.email} already exists, skipping auth creation`)
        
        // Try to get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(u => u.email === demoUser.email)
        
        if (!existingUser) {
          throw new Error(`Could not find existing user ${demoUser.email}`)
        }
        
        authUser = { user: existingUser }
      } else {
        throw authError
      }
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: demoUser.id,
        auth_id: authUser.user.id,
        full_name: demoUser.full_name,
        preferred_locale: 'en',
        timezone: 'America/Los_Angeles'
      })

    if (profileError && profileError.code !== '23505') {
      console.warn(`⚠️  Profile creation warning for ${demoUser.email}: ${profileError.message}`)
    }

    // Create membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .upsert({
        user_id: demoUser.id,
        organization_id: DEMO_ORG_ID,
        role: demoUser.role,
        status: 'active'
      })

    if (membershipError && membershipError.code !== '23505') {
      console.warn(`⚠️  Membership creation warning for ${demoUser.email}: ${membershipError.message}`)
    }

    console.log(`✅ Demo user created: ${demoUser.email} (${demoUser.role})`)
    return { success: true, email: demoUser.email, role: demoUser.role }

  } catch (error) {
    console.error(`❌ Failed to create demo user ${demoUser.email}:`, error.message)
    return { success: false, email: demoUser.email, error: error.message }
  }
}

async function seedDemoData() {
  console.log('🌱 Seeding demo data...')
  
  try {
    // Create demo projects
    const { error: projectsError } = await supabase
      .from('projects')
      .upsert([
        {
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          organization_id: DEMO_ORG_ID,
          name: 'Summer Music Festival 2025',
          status: 'planning',
          starts_at: '2025-07-15',
          ends_at: '2025-07-20',
          created_by: '11111111-1111-1111-1111-111111111111'
        },
        {
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          organization_id: DEMO_ORG_ID,
          name: 'Corporate Conference Q2',
          status: 'active',
          starts_at: '2025-04-10',
          ends_at: '2025-04-12',
          created_by: '22222222-2222-2222-2222-222222222222'
        }
      ])

    if (projectsError && projectsError.code !== '23505') {
      console.warn('⚠️  Projects seeding warning:', projectsError.message)
    }

    // Create demo companies
    const { error: companiesError } = await supabase
      .from('companies')
      .upsert([
        {
          organization_id: DEMO_ORG_ID,
          name: 'Starlight Productions',
          website: 'https://starlight.example.com',
          contact_email: 'contact@starlight.example.com'
        },
        {
          organization_id: DEMO_ORG_ID,
          name: 'Atlas Logistics',
          website: 'https://atlas.example.com',
          contact_email: 'info@atlas.example.com'
        }
      ])

    if (companiesError && companiesError.code !== '23505') {
      console.warn('⚠️  Companies seeding warning:', companiesError.message)
    }

    console.log('✅ Demo data seeded successfully')
    
  } catch (error) {
    console.error('❌ Failed to seed demo data:', error.message)
  }
}

async function main() {
  console.log('🚀 Setting up GHXSTSHIP demo users...\n')
  
  try {
    // Create demo organization
    await createDemoOrganization()
    
    // Create demo users
    const results = []
    for (const demoUser of DEMO_USERS) {
      const result = await createDemoUser(demoUser)
      results.push(result)
    }
    
    // Seed demo data
    await seedDemoData()
    
    // Summary
    console.log('\n📊 Setup Summary:')
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    console.log(`✅ Successfully created: ${successful.length} users`)
    successful.forEach(r => console.log(`   - ${r.email} (${r.role})`))
    
    if (failed.length > 0) {
      console.log(`❌ Failed to create: ${failed.length} users`)
      failed.forEach(r => console.log(`   - ${r.email}: ${r.error}`))
    }
    
    console.log('\n🎯 Demo users are ready!')
    console.log('Visit /demo to switch between different user roles')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { createDemoUser, createDemoOrganization, seedDemoData }
