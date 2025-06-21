'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  // Don't show navbar on log page
  if (pathname === '/log') {
    return null
  }

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: Plus,
      label: 'Add Data',
      href: '/log',
      isCenter: true,
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-linear-bg border-t border-linear-border md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isCenter = item.isCenter

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative",
                "transition-all duration-200",
                isCenter && "mx-2"
              )}
            >
              {isCenter ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-linear-purple rounded-full flex items-center justify-center shadow-lg mb-1">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-linear-purple">
                    Add
                  </span>
                </div>
              ) : (
                <>
                  <Icon
                    className={cn(
                      "h-5 w-5 mb-1 transition-colors",
                      isActive ? "text-linear-purple" : "text-linear-text-secondary"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      isActive ? "text-linear-purple" : "text-linear-text-secondary"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}