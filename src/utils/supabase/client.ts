// import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Temporarily disabled for deployment debugging
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return null as any
  
  // return createBrowserClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // )
}