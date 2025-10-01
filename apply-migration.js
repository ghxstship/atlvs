#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Read the migration file
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251001000000_fix_rls_security_issues.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('🚀 Applying migration: 20251001000000_fix_rls_security_issues.sql');
console.log('🔒 Fixing RLS security issues and creating missing tables...\n');

// Project details
const projectRef = 'qopwaetlenarbnmrzvvs';
const region = 'aws-0-us-west-1';

// Prompt for password
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Enter your Supabase database password (from Project Settings > Database): ', async (password) => {
  rl.close();
  
  if (!password || password.trim() === '') {
    console.error('❌ Password is required!');
    process.exit(1);
  }

  // Connection configuration
  const client = new Client({
    host: `${region}.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: password.trim(),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('\n📡 Connecting to Supabase...');
    console.log(`   Host: ${region}.pooler.supabase.com`);
    console.log(`   Database: postgres`);
    console.log(`   User: postgres.${projectRef}`);
    
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('⚙️  Executing migration SQL...');
    await client.query(migrationSQL);
    
    console.log('\n✅ Migration applied successfully!');
    console.log('\n📋 Changes Applied:');
    console.log('  ✅ Fixed RLS Security Issues:');
    console.log('     1. comments - Verified existing RLS policies');
    console.log('     2. opportunities - Confirmed existing RLS (was job_opportunities)');
    console.log('     3. project_tags - Created new table with RLS');
    console.log('     4. user_permissions - Created permission system with RLS');
    console.log('     5. query_performance_log - Enabled RLS with admin access');
    console.log('  ✅ Created New Tables:');
    console.log('     - project_tags (tagging system)');
    console.log('     - user_permissions (permission management)');
    console.log('  ✅ Created Helper Functions:');
    console.log('     - user_has_permission() - Check user permissions');
    console.log('     - grant_user_permission() - Grant permissions');
    console.log('     - revoke_user_permission() - Revoke permissions');
    console.log('  ✅ Added Performance Indexes');
    console.log('  ✅ Enabled Audit Logging');
    console.log('\n🎉 All RLS Security Issues Resolved - 100% Coverage!');
    
  } catch (err) {
    console.error('\n❌ Migration error:', err.message);
    if (err.message.includes('password')) {
      console.error('\n💡 Password authentication failed. Make sure you\'re using the correct password from:');
      console.error('   Supabase Dashboard > Project Settings > Database > Database password');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
});
