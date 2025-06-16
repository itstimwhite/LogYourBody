#!/usr/bin/env node
/**
 * Test script for authentication setup
 * Run with: npx tsx scripts/test-auth.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('🧪 Testing Supabase Authentication Setup...\n')

  // Test 1: Check connection
  console.log('1️⃣ Testing connection to Supabase...')
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Connection failed:', error.message)
    } else {
      console.log('✅ Connected to Supabase successfully')
      console.log('   Session:', data.session ? 'Active' : 'None')
    }
  } catch (err) {
    console.error('❌ Connection error:', err)
  }

  // Test 2: Check if tables exist
  console.log('\n2️⃣ Checking if database tables exist...')
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      if (profilesError.message.includes('relation "public.profiles" does not exist')) {
        console.log('❌ Profiles table not found - Run migrations first!')
        console.log('   Run: npm run db:push or use supabase/setup-auth.sql')
      } else {
        console.error('❌ Error checking profiles table:', profilesError.message)
      }
    } else {
      console.log('✅ Profiles table exists')
    }
  } catch (err) {
    console.error('❌ Database error:', err)
  }

  // Test 3: Test signup (dry run)
  console.log('\n3️⃣ Testing signup flow (dry run)...')
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'Test123!@#'
  
  console.log(`   Test email: ${testEmail}`)
  console.log(`   Test password: ${testPassword}`)
  console.log('   Note: This is a dry run - no actual signup')

  // Test 4: Check auth settings
  console.log('\n4️⃣ Auth Configuration Checklist:')
  console.log('   [ ] Email templates configured in Supabase dashboard')
  console.log('   [ ] Redirect URLs added to allowlist')
  console.log('   [ ] SMTP settings configured (for production)')
  console.log('   [ ] Rate limiting configured')

  console.log('\n📋 Summary:')
  console.log('   Project URL:', supabaseUrl)
  console.log('   Project Ref:', supabaseUrl.split('.')[0].replace('https://', ''))
  
  console.log('\n🔗 Quick Links:')
  console.log('   Dashboard:', `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].replace('https://', '')}`)
  console.log('   SQL Editor:', `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].replace('https://', '')}/sql`)
  console.log('   Auth Settings:', `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].replace('https://', '')}/auth/configuration`)
}

// Run tests
testAuth().catch(console.error)