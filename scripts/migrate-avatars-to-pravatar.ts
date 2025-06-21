#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { getProfileAvatarUrl } from '../src/utils/pravatar-utils'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateAvatars() {
  console.log('🔄 Starting avatar migration from DiceBear to Pravatar...\n')

  try {
    // Fetch all profiles with DiceBear avatars
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .like('avatar_url', '%dicebear%')

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError.message)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('✅ No profiles with DiceBear avatars found. Migration complete!')
      return
    }

    console.log(`📋 Found ${profiles.length} profiles with DiceBear avatars\n`)

    // Update each profile
    let successCount = 0
    let errorCount = 0

    for (const profile of profiles) {
      try {
        // Generate new Pravatar URL using username or ID
        const identifier = profile.username || profile.id
        const newAvatarUrl = getProfileAvatarUrl(identifier, 300)

        // Update the profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', profile.id)

        if (updateError) {
          console.error(`❌ Error updating profile ${identifier}:`, updateError.message)
          errorCount++
        } else {
          console.log(`✅ Updated avatar for ${identifier}`)
          console.log(`   Old: ${profile.avatar_url}`)
          console.log(`   New: ${newAvatarUrl}`)
          successCount++
        }
      } catch (error) {
        console.error(`❌ Unexpected error for profile ${profile.id}:`, error)
        errorCount++
      }
    }

    // Also update progress photos if they use DiceBear
    console.log('\n🔄 Checking progress photos...')
    
    const { data: photos, error: photosError } = await supabase
      .from('progress_photos')
      .select('id, user_id, photo_url, thumbnail_url, angle, date')
      .or('photo_url.like.%dicebear%,thumbnail_url.like.%dicebear%')

    if (photosError) {
      console.log('⚠️  Progress photos table might not exist:', photosError.message)
    } else if (photos && photos.length > 0) {
      console.log(`📋 Found ${photos.length} progress photos with DiceBear URLs\n`)

      for (const photo of photos) {
        try {
          // Get username for the user
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', photo.user_id)
            .single()

          const username = profile?.username || photo.user_id
          const photoIdentifier = `${username}-${photo.date}-${photo.angle}`
          
          const updates: any = {}
          
          if (photo.photo_url?.includes('dicebear')) {
            updates.photo_url = getProfileAvatarUrl(photoIdentifier, 600)
          }
          
          if (photo.thumbnail_url?.includes('dicebear')) {
            updates.thumbnail_url = getProfileAvatarUrl(photoIdentifier, 150)
          }

          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('progress_photos')
              .update(updates)
              .eq('id', photo.id)

            if (updateError) {
              console.error(`❌ Error updating photo ${photo.id}:`, updateError.message)
              errorCount++
            } else {
              console.log(`✅ Updated progress photo for ${username} (${photo.angle} - ${photo.date})`)
              successCount++
            }
          }
        } catch (error) {
          console.error(`❌ Unexpected error for photo ${photo.id}:`, error)
          errorCount++
        }
      }
    } else {
      console.log('✅ No progress photos with DiceBear URLs found.')
    }

    // Summary
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successfully updated: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log('\n🎉 Avatar migration complete!')

  } catch (error) {
    console.error('❌ Fatal error during migration:', error)
    process.exit(1)
  }
}

// Run the migration
migrateAvatars()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })