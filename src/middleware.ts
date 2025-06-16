import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/profile']

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  // Update user's auth session
  const response = await updateSession(request)
  
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Get session from the response
  const sessionCookie = response.cookies.get('sb-auth-token')
  const hasSession = !!sessionCookie
  
  // Redirect logic
  if (isProtectedRoute && !hasSession) {
    // Redirect to login if trying to access protected route without session
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  if (isAuthRoute && hasSession) {
    // Redirect to dashboard if trying to access auth routes with active session
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}