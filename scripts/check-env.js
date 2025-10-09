#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Checks for required environment variables and provides helpful error messages
 */

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL (required for all database operations)',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key (required for client-side operations)',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key (required for server-side admin operations)',
};

const optionalVars = {
  'NEXT_PUBLIC_APP_URL': 'Application URL (defaults to localhost in development)',
  'STRIPE_SECRET_KEY': 'Stripe secret key (required for payment processing)',
  'STRIPE_WEBHOOK_SECRET': 'Stripe webhook secret (required for webhook handling)',
  'GOOGLE_CLIENT_ID': 'Google OAuth client ID (required for Google sign-in)',
  'GOOGLE_CLIENT_SECRET': 'Google OAuth client secret (required for Google sign-in)',
};

console.log('🔍 Checking environment variables...\n');

let missingRequired = [];
let missingOptional = [];

// Check required variables
for (const [key, description] of Object.entries(requiredVars)) {
  if (!process.env[key]) {
    missingRequired.push({ key, description });
    console.log(`❌ MISSING REQUIRED: ${key}`);
    console.log(`   ${description}\n`);
  } else {
    console.log(`✅ ${key}`);
  }
}

console.log('\n📋 Optional variables:\n');

// Check optional variables
for (const [key, description] of Object.entries(optionalVars)) {
  if (!process.env[key]) {
    missingOptional.push({ key, description });
    console.log(`⚠️  NOT SET: ${key}`);
    console.log(`   ${description}\n`);
  } else {
    console.log(`✅ ${key}`);
  }
}

// Summary
console.log('\n📊 Summary:');
console.log(`   Required: ${Object.keys(requiredVars).length - missingRequired.length}/${Object.keys(requiredVars).length} configured`);
console.log(`   Optional: ${Object.keys(optionalVars).length - missingOptional.length}/${Object.keys(optionalVars).length} configured\n`);

if (missingRequired.length > 0) {
  console.log('❌ SETUP INCOMPLETE: Missing required environment variables');
  console.log('\n📝 To fix this:');
  console.log('   1. Copy .env.example to .env.local');
  console.log('   2. Fill in the required values');
  console.log('   3. Restart your development server\n');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!\n');
  
  if (missingOptional.length > 0) {
    console.log(`⚠️  ${missingOptional.length} optional variable(s) not configured`);
    console.log('   Some features may not work without these values\n');
  }
  
  process.exit(0);
}
