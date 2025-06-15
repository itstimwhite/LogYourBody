import { type NextRequest, NextResponse } from 'next/server'
// import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Temporarily disabled for deployment debugging
  return NextResponse.next({ request })
  
  // let supabaseResponse = NextResponse.next({
  //   request,
  // })

  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       getAll() {
  //         return request.cookies.getAll()
  //       },
  //       setAll(cookiesToSet) {
  //         cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
  //         supabaseResponse = NextResponse.next({
  //           request,
  //         })
  //         cookiesToSet.forEach(({ name, value, options }) =>
  //           supabaseResponse.cookies.set(name, value, options)
  //         )
  //       },
  //     },
  //   }
  // )

  // const { data: { user } } = await supabase.auth.getUser()

  // // Protected routes
  // if (request.nextUrl.pathname.startsWith('/dashboard') ||
  //     request.nextUrl.pathname.startsWith('/settings') ||
  //     request.nextUrl.pathname.startsWith('/subscription')) {
  //   if (!user) {
  //     return NextResponse.redirect(new URL('/login', request.url))
  //   }
  // }

  // // Redirect logged-in users away from auth pages
  // if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  // return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}