// import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  // Temporarily disabled for deployment debugging
  // const supabase = await createClient()
  // await supabase.auth.signOut()
  redirect('/')
}