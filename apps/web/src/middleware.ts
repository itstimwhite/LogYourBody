import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/log(.*)',
  '/api/weights(.*)',
  '/api/auth/delete-account',
  '/onboarding(.*)',
  '/settings(.*)',
  '/photos(.*)',
  '/steps(.*)',
  '/import(.*)',
])

const isPublicRoute = createRouteMatcher([
  '/signin(.*)',
  '/signup(.*)',
  '/login(.*)', // Keep for backwards compatibility
  '/',
  '/forgot-password(.*)',
  '/terms(.*)',
  '/privacy(.*)',
  '/about(.*)',
  '/blog(.*)',
  '/mobile(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

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