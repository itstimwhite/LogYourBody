#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { format } from 'date-fns'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSeededUsers() {
  console.log('🔍 Testing seeded users...\n')

  try {
    // Get all test users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        auth_users:user_id(email)
      `)
      .order('created_at', { ascending: true })

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found. Have you run the seed script?')
      return
    }

    console.log(`✅ Found ${users.length} users:\n`)

    // Display each user with their journey
    for (const user of users) {
      console.log(`👤 ${user.full_name} (@${user.username})`)
      console.log(`   Email: ${user.auth_users?.email || 'N/A'}`)
      console.log(`   Gender: ${user.gender}`)
      console.log(`   Age: ${calculateAge(user.date_of_birth)} years`)
      console.log(`   Height: ${formatHeight(user.height, user.height_unit)}`)
      console.log(`   Activity: ${user.activity_level.replace('_', ' ')}`)
      console.log(`   Bio: ${user.bio}`)

      // Get their body metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', user.user_id)
        .order('date', { ascending: true })

      if (metricsError) {
        console.log(`   ❌ Error fetching metrics: ${metricsError.message}`)
      } else if (metrics && metrics.length > 0) {
        const firstMetric = metrics[0]
        const lastMetric = metrics[metrics.length - 1]
        
        console.log(`\n   📊 Progress (${metrics.length} entries):`)
        console.log(`   Starting: ${formatWeight(firstMetric.weight, firstMetric.weight_unit)} | ${firstMetric.body_fat_percentage}% BF`)
        console.log(`   Current:  ${formatWeight(lastMetric.weight, lastMetric.weight_unit)} | ${lastMetric.body_fat_percentage}% BF`)
        
        const weightChange = lastMetric.weight - firstMetric.weight
        const bfChange = lastMetric.body_fat_percentage - firstMetric.body_fat_percentage
        
        console.log(`   Change:   ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} ${lastMetric.weight_unit} | ${bfChange > 0 ? '+' : ''}${bfChange.toFixed(1)}% BF`)
        
        if (lastMetric.muscle_mass && firstMetric.muscle_mass) {
          const muscleChange = lastMetric.muscle_mass - firstMetric.muscle_mass
          console.log(`   Muscle:   ${muscleChange > 0 ? '+' : ''}${muscleChange.toFixed(1)} ${lastMetric.weight_unit}`)
        }
      }

      // Check for daily metrics (steps)
      const { data: dailyMetrics, error: dailyError } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.user_id)
        .order('date', { ascending: false })
        .limit(7)

      if (!dailyError && dailyMetrics && dailyMetrics.length > 0) {
        const avgSteps = Math.round(
          dailyMetrics.reduce((sum, d) => sum + (d.steps || 0), 0) / dailyMetrics.length
        )
        console.log(`   👟 Avg steps (last 7 days): ${avgSteps.toLocaleString()}`)
      }

      console.log('\n' + '─'.repeat(60) + '\n')
    }

    // Summary statistics
    console.log('📈 Summary Statistics:')
    console.log(`   Total users: ${users.length}`)
    console.log(`   Male: ${users.filter(u => u.gender === 'male').length}`)
    console.log(`   Female: ${users.filter(u => u.gender === 'female').length}`)
    
    const { data: allMetrics } = await supabase
      .from('body_metrics')
      .select('user_id')
    
    console.log(`   Total body metrics entries: ${allMetrics?.length || 0}`)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function formatHeight(height: number, unit: string): string {
  if (unit === 'cm') {
    return `${height} cm`
  } else {
    const feet = Math.floor(height / 12)
    const inches = height % 12
    return `${feet}'${inches}"`
  }
}

function formatWeight(weight: number, unit: string): string {
  if (unit === 'kg') {
    return `${weight.toFixed(1)} kg`
  } else {
    return `${weight.toFixed(1)} lbs`
  }
}

// Run the test
testSeededUsers()
  .then(() => {
    console.log('✅ Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })