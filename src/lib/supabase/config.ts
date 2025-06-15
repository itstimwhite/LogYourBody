// Supabase configuration with build-time fallbacks
export const supabaseConfig = {
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
  }
}

// Export for use in components
export const SUPABASE_URL = supabaseConfig.getSafeUrl()
export const SUPABASE_ANON_KEY = supabaseConfig.getSafeAnonKey()
export const IS_SUPABASE_CONFIGURED = supabaseConfig.isConfigured()