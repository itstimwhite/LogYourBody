import { NextResponse } from 'next/server'

export async function GET() {
  // Only show debug info in non-production or with a secret
  const isDebugAllowed = process.env.NODE_ENV !== 'production' || 
                        process.env.DEBUG_SECRET === 'your-secret-here'
  
  if (!isDebugAllowed) {
    return NextResponse.json({ error: 'Debug not allowed' }, { status: 403 })
  }
  
  const debugInfo = {
    node_version: process.version,
    vercel_env: process.env.VERCEL_ENV,
    node_env: process.env.NODE_ENV,
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_database_url: !!process.env.DATABASE_URL,
    has_postgres_url: !!process.env.POSTGRES_URL,
    build_target: process.env.BUILD_TARGET,
    next_version: process.env.npm_package_dependencies_next || 'unknown',
  }
  
  return NextResponse.json(debugInfo)
}