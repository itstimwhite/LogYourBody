#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUsers() {
  console.log('Checking users in database...\n')
  
  // Sign in as one of our test users to bypass RLS
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'sarah.chen@example.com',
    password: 'password123'
  })
  
  if (authError) {
    console.error('Auth error:', authError)
    return
  }
  
  console.log('✅ Signed in as Sarah Chen\n')
  
  // Now query profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')
  
  if (profilesError) {
    console.error('Profiles error:', profilesError)
    return
  }
  
  console.log(`Found ${profiles?.length || 0} profiles:`)
  profiles?.forEach(p => {
    console.log(`- ${p.full_name || 'No name'} (${p.email})`)
    console.log(`  Gender: ${p.gender || 'Not set'}`)
    console.log(`  Height: ${p.height || 'Not set'} ${p.height_unit || ''}`)
    console.log(`  Goals: BF ${p.goal_body_fat_percentage}%, Weight ${p.goal_weight} ${p.goal_weight_unit}`)
    console.log('')
  })
  
  // Check body metrics
  const { data: metrics } = await supabase
    .from('body_metrics')
    .select('user_id, count')
    .order('date', { ascending: false })
    .limit(10)
  
  console.log(`\nRecent body metrics: ${metrics?.length || 0} entries`)
  
  // Check progress photos
  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .limit(10)
  
  console.log(`Progress photos: ${photos?.length || 0} photos`)
  
  // Check daily metrics
  const { data: daily } = await supabase
    .from('daily_metrics')
    .select('*')
    .limit(10)
  
  console.log(`Daily metrics: ${daily?.length || 0} entries`)
}

checkUsers()
  .then(() => process.exit(0))
  .catch(console.error)