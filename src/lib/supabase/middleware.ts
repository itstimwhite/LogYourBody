import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make your server
    // vulnerable to CSRF attacks.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const pathname = url.pathname
    
    // Define auth routes
    const isAuthRoute = pathname.startsWith('/login') || 
                       pathname.startsWith('/signup') || 
                       pathname.startsWith('/auth') ||
                       pathname.startsWith('/forgot-password')
    
    // Define protected routes
    const protectedRoutes = ['/dashboard', '/settings', '/profile', '/log']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    // Allow auth callbacks to process
    if (pathname.startsWith('/auth/callback')) {
      return supabaseResponse
    }
    
    // Only redirect from auth pages if user is authenticated AND it's not an API route
    // This prevents redirect loops with client-side navigation
    if (user && isAuthRoute && !pathname.includes('/api/')) {
      // Skip redirect if this is a client-side navigation (has specific headers)
      const isClientNavigation = request.headers.get('x-nextjs-data') || 
                                request.headers.get('accept')?.includes('application/json')
      
      if (!isClientNavigation) {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // Redirect unauthenticated users to login for protected routes
    if (!user && isProtectedRoute) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're trying to modify the response object based on the user's
    // authentication status, make sure to do it above.
    return supabaseResponse
  } catch (error) {
    // If there's an error with Supabase, allow the request to continue
    console.error('Middleware error:', error)
    return NextResponse.next({
      request,
    })
  }
}