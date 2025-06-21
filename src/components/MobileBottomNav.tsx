'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export function MobileBottomNav() {
  const { user } = useAuth()
  const pathname = usePathname()

  const protectedRoutes = ['/dashboard', '/settings', '/profile', '/log', '/photos', '/steps']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!user || !isProtectedRoute) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center border-t border-linear-border bg-linear-card pb-safe pt-2 md:hidden"
      aria-label="Primary"
    >
      <Link
        href="/"
        className="flex flex-col items-center justify-center text-linear-text-secondary hover:text-linear-text"
        aria-label="Home"
      >
        <Home className="h-6 w-6" />
        <span className="sr-only">Home</span>
      </Link>

      <Link
        href="/log"
        className={cn(
          'flex -translate-y-4 items-center justify-center rounded-full bg-linear-purple p-4 text-linear-text shadow-lg'
        )}
        aria-label="New Entry"
      >
        <PlusCircle className="h-8 w-8" />
      </Link>

      <Link
        href="/settings"
        className="flex flex-col items-center justify-center text-linear-text-secondary hover:text-linear-text"
        aria-label="Settings"
      >
        <Settings className="h-6 w-6" />
        <span className="sr-only">Settings</span>
      </Link>
    </nav>
  )
}

export default MobileBottomNav
