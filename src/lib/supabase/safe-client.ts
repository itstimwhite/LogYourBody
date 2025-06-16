// Safe Supabase client wrapper that handles missing environment variables
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_SUPABASE_CONFIGURED } from './config'

// Export safe client that won't throw during build
// When not configured, it uses placeholder values that won't cause errors
export const safeSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: !IS_SUPABASE_CONFIGURED ? false : true,
    autoRefreshToken: !IS_SUPABASE_CONFIGURED ? false : true,
  },
  // Disable real-time features when not configured
  realtime: {
    params: {
      eventsPerSecond: IS_SUPABASE_CONFIGURED ? 10 : -1,
    },
  },
})