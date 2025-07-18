#!/usr/bin/env node

// Test script to verify Clerk configuration
// Run with: node scripts/test-clerk-config.js

const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

console.log('🔍 Checking Clerk Configuration...\n');

let allPresent = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  
  if (value) {
    // Mask the value for security
    const prefix = value.substring(0, 7);
    const masked = prefix + '*'.repeat(20);
    console.log(`✅ ${envVar}: ${masked}`);
    
    // Validate format
    if (envVar === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY' && !value.startsWith('pk_')) {
      console.log(`   ⚠️  Warning: Publishable key should start with 'pk_'`);
    }
    if (envVar === 'CLERK_SECRET_KEY' && !value.startsWith('sk_')) {
      console.log(`   ⚠️  Warning: Secret key should start with 'sk_'`);
    }
  } else {
    console.log(`❌ ${envVar}: Not set`);
    allPresent = false;
  }
});

console.log('\n' + '-'.repeat(50));

if (allPresent) {
  console.log('✅ All Clerk environment variables are configured!');
  process.exit(0);
} else {
  console.log('❌ Some Clerk environment variables are missing.');
  console.log('\nTo fix this:');
  console.log('1. Get your keys from https://dashboard.clerk.com');
  console.log('2. Add them as GitHub secrets or to your .env.local file');
  process.exit(1);
}