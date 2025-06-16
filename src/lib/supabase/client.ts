import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_SUPABASE_CONFIGURED, supabaseConfig } from './config'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Environment detection helpers
export function getSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const vercelEnv = process.env.VERCEL_ENV
  
  // Use Vercel environment if available
  if (vercelEnv) {
    return vercelEnv === 'production' ? 'production' : 'development'
  }
  
  // Fallback to URL detection
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return 'local'
  }
  
  return process.env.NODE_ENV || 'unknown'
}

export function getVercelEnvironment() {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'
}

export function validateSupabaseKeys() {
  const validation = {
    url: {
      exists: IS_SUPABASE_CONFIGURED,
      valid: IS_SUPABASE_CONFIGURED,
      value: supabaseConfig.url || 'missing'
    },
    anonKey: {
      exists: IS_SUPABASE_CONFIGURED,
      valid: IS_SUPABASE_CONFIGURED,
      value: supabaseConfig.anonKey ? `${supabaseConfig.anonKey.substring(0, 20)}...` : 'missing'
    }
  }
  
  return validation
}

// Test connection to Supabase
export async function testSupabaseConnection() {
  // Check if we have valid credentials first
  const validation = validateSupabaseKeys()
  if (!validation.url.valid || !validation.anonKey.valid) {
    return {
      success: false,
      error: 'Invalid or missing Supabase credentials',
      details: 'Please check environment variables'
    }
  }

  try {
    const { error } = await supabase.from('_').select('*').limit(1)
    
    if (error) {
      return {
        success: false,
        error: error.message,
        details: 'Database connection failed'
      }
    }
    
    return {
      success: true,
      message: 'Connected successfully'
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: 'Network or configuration error'
    }
  }
}