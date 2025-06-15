import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Environment detection helpers
export function getSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return 'local'
  } else if (url.includes('staging') || url.includes('preview')) {
    return 'staging'
  } else if (url.includes('prod') || url.includes('production')) {
    return 'production'
  } else {
    return 'unknown'
  }
}

export function getVercelEnvironment() {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'
}

export function validateSupabaseKeys() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const validation = {
    url: {
      exists: !!url,
      valid: url ? url.startsWith('https://') && url.includes('supabase') : false,
      value: url || 'missing'
    },
    anonKey: {
      exists: !!anonKey,
      valid: anonKey ? anonKey.length > 100 : false, // Supabase keys are typically long
      value: anonKey ? `${anonKey.substring(0, 20)}...` : 'missing'
    }
  }
  
  return validation
}

// Test connection to Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('_').select('*').limit(1)
    
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