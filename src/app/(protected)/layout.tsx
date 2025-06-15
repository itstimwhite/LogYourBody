// import { redirect } from 'next/navigation'
// import { createClient } from '@/utils/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily disabled for deployment debugging
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/login')
  // }

  return <>{children}</>
}