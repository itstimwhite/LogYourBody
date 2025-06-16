// Supabase configuration with build-time fallbacks
// Check for Vercel's auto-provisioned Supabase or standard env vars

// Helper to extract Supabase project ID from database URL
function extractSupabaseProjectId(): string | null {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
  // Vercel Supabase URLs look like: postgres://postgres:[password]@db.[project-id].supabase.co:5432/postgres
  const match = dbUrl.match(/db\.([a-z0-9]+)\.supabase\.co/)
  return match ? match[1] : null
}

// Try to construct Supabase URL from Vercel's database URL if needed
function getSupabaseUrl(): string {
  // First try standard env vars
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return process.env.NEXT_PUBLIC_SUPABASE_URL
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL
  
  // Try to construct from Vercel's database URL
  const projectId = extractSupabaseProjectId()
  if (projectId) {
    return `https://${projectId}.supabase.co`
  }
  
  return ''
}

export const supabaseConfig = {
  // Try multiple sources for the URL
  url: getSupabaseUrl(),
  // Vercel marketplace integration might not provide anon key
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
           process.env.SUPABASE_ANON_KEY ||
           process.env.NEXT_PUBLIC_SUPABASE_ANON ||
           '',
  
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
  
  // Debug helper for Vercel deployments
  getDebugInfo() {
    return {
      hasSupabaseUrl: !!this.url,
      hasAnonKey: !!this.anonKey,
      detectedProjectId: extractSupabaseProjectId(),
      vercelEnv: process.env.VERCEL_ENV,
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
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