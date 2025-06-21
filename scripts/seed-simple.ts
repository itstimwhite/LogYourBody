#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

async function seedDatabase() {
  console.log('🌱 Creating test users...\n')
  
  const users = [
    {
      email: 'sarah.chen@example.com',
      password: 'password123',
      name: 'Sarah Chen',
      description: 'Weight loss journey - Female'
    },
    {
      email: 'marcus.johnson@example.com',
      password: 'password123',
      name: 'Marcus Johnson',
      description: 'Bulking - Male'
    },
    {
      email: 'emily.rodriguez@example.com',
      password: 'password123',
      name: 'Emily Rodriguez',
      description: 'Maintenance - Female'
    },
    {
      email: 'david.kim@example.com',
      password: 'password123',
      name: 'David Kim',
      description: 'Weight loss journey - Male'
    },
    {
      email: 'jessica.thompson@example.com',
      password: 'password123',
      name: 'Jessica Thompson',
      description: 'Recomposition - Female'
    }
  ]
  
  console.log('📝 Creating users through signup...')
  console.log('Note: You may need to confirm emails manually in Supabase dashboard\n')
  
  for (const user of users) {
    // Create a new client for each user
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    console.log(`Creating ${user.name}...`)
    
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name
        }
      }
    })
    
    if (error) {
      console.error(`❌ Error creating ${user.email}:`, error.message)
    } else if (data.user) {
      console.log(`✅ Created ${user.name} (${user.description})`)
      console.log(`   ID: ${data.user.id}`)
      console.log(`   Email confirmation required: ${!data.user.email_confirmed_at}`)
    }
  }
  
  console.log('\n✅ User creation complete!')
  console.log('\n📧 Next steps:')
  console.log('1. Check your Supabase dashboard to confirm user emails')
  console.log('2. Users can now log in with password: password123')
  console.log('3. Each user will need to complete their profile after first login')
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })