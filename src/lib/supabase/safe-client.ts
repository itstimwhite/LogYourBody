// Safe Supabase client wrapper that handles missing environment variables
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_SUPABASE_CONFIGURED } from './config'

// Create a no-op Supabase client for when credentials are missing
function createNoOpClient(): SupabaseClient {
  const noOpClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  // Override methods to return safe defaults
  const originalFrom = noOpClient.from.bind(noOpClient)
  noOpClient.from = (table: string) => {
    const query = originalFrom(table)
    const originalSelect = query.select.bind(query)
    query.select = () => {
      const result = originalSelect()
      // Override the promise to return empty data
      const originalThen = result.then.bind(result)
      result.then = (onFulfilled: any, onRejected?: any) => {
        return originalThen(() => ({ data: [], error: null }), onRejected)
      }
      return result
    }
    return query
  }
  
  return noOpClient
}

// Export safe client that won't throw during build
export const safeSupabase = IS_SUPABASE_CONFIGURED 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createNoOpClient()