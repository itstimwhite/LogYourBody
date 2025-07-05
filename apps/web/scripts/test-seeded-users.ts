#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { format } from 'date-fns'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSeededUsers() {
  console.log('🔍 Testing seeded users...\n')

  try {
    // Get all users from profiles table
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
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
      console.log(`👤 ${user.full_name || 'No name'} (@${user.username || 'no-username'})`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Gender: ${user.gender || 'Not set'}`)
      console.log(`   Age: ${user.date_of_birth ? calculateAge(user.date_of_birth) + ' years' : 'Not set'}`)
      console.log(`   Height: ${user.height ? formatHeight(user.height, user.height_unit) : 'Not set'}`)
      console.log(`   Activity: ${user.activity_level ? user.activity_level.replace('_', ' ') : 'Not set'}`)
      console.log(`   Bio: ${user.bio || 'No bio'}`)
      
      // Display goals
      if (user.goal_body_fat_percentage || user.goal_weight) {
        console.log(`\n   🎯 Goals:`)
        if (user.goal_weight) {
          console.log(`   Weight: ${formatWeight(user.goal_weight, user.goal_weight_unit || 'kg')}`)
        }
        if (user.goal_body_fat_percentage) {
          console.log(`   Body Fat: ${user.goal_body_fat_percentage}%`)
        }
        if (user.goal_ffmi) {
          console.log(`   FFMI: ${user.goal_ffmi}`)
        }
        if (user.goal_waist_to_hip_ratio) {
          console.log(`   WHR: ${user.goal_waist_to_hip_ratio}`)
        }
      }

      // Get their body metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', user.id)
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

      // Check for progress photos
      const { data: photos, error: photosError } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      if (!photosError && photos && photos.length > 0) {
        console.log(`   📸 Progress photos: ${photos.length} photos`)
        const angles = [...new Set(photos.map(p => p.angle))].join(', ')
        console.log(`   Angles: ${angles}`)
      }

      // Check for daily metrics (steps)
      const { data: dailyMetrics, error: dailyError } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.id)
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