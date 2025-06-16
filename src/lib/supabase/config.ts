// Supabase configuration with build-time fallbacks
export const supabaseConfig = {
  // Standard environment variables
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Check if we have valid configuration
  isConfigured() {
    return Boolean(
      this.url && 
      this.url !== '' && 
      !this.url.includes('placeholder') &&
      this.anonKey && 
      this.anonKey !== '' &&
      !this.anonKey.includes('placeholder')
    )
  },
  
  // Get safe values for build time
  getSafeUrl() {
    return this.isConfigured() ? this.url : 'https://placeholder.supabase.co'
  },
  
  getSafeAnonKey() {
    return this.isConfigured() ? this.anonKey : 'placeholder-key'
  },
  
  // Debug helper for deployments
  getDebugInfo() {
    return {
      hasSupabaseUrl: !!this.url,
      hasAnonKey: !!this.anonKey,
      vercelEnv: process.env.VERCEL_ENV,
      nodeEnv: process.env.NODE_ENV,
      isConfigured: this.isConfigured(),
    }
  }
}

// Log debug info during build (only in Vercel)
if (process.env.VERCEL) {
  console.log('Supabase Config Debug:', supabaseConfig.getDebugInfo())
}

// Export for use in components
export const SUPABASE_URL = supabaseConfig.getSafeUrl()
export const SUPABASE_ANON_KEY = supabaseConfig.getSafeAnonKey()
export const IS_SUPABASE_CONFIGURED = supabaseConfig.isConfigured()