#!/usr/bin/env node
/**
 * Run database migration manually
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

console.log('📋 Manual Migration Instructions:\n')
console.log('Since we need database admin access, please run the migration manually:')
console.log('\n1. Go to your Supabase SQL Editor:')
console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].replace('https://', '')}/sql\n`)
console.log('2. Click "New query"\n')
console.log('3. Copy and paste the contents of:')
console.log('   supabase/setup-auth.sql\n')
console.log('4. Click "Run"\n')
console.log('5. You should see "Setup completed successfully!" at the bottom\n')

// Read and display the migration file
try {
  const migrationPath = path.join(process.cwd(), 'supabase', 'setup-auth.sql')
  const migrationContent = fs.readFileSync(migrationPath, 'utf8')
  
  console.log('📄 Migration Preview (first 20 lines):')
  console.log('=' .repeat(50))
  const lines = migrationContent.split('\n').slice(0, 20)
  lines.forEach(line => console.log(line))
  console.log('...')
  console.log('=' .repeat(50))
} catch (err) {
  console.error('Could not read migration file:', err)
}