'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  User, 
  Shield, 
  Globe, 
  Bell,
  Heart,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const settingsNav = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: Shield,
  },
  {
    title: 'Preferences',
    href: '/settings/preferences',
    icon: Globe,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Subscription',
    href: '/settings/subscription',
    icon: Heart,
  }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Mobile view - show settings page normally
  if (pathname === '/settings') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Desktop Layout with Sidebar */}
      <div className="hidden md:flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-linear-border bg-linear-card h-screen sticky top-0">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center gap-2 mb-8">
              <ArrowLeft className="h-4 w-4 text-linear-text-secondary" />
              <span className="text-sm text-linear-text-secondary">Back to dashboard</span>
            </Link>
            
            <h2 className="text-lg font-semibold text-linear-text mb-4">Settings</h2>
            
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-linear-purple/10 text-linear-text"
                        : "text-linear-text-secondary hover:text-linear-text hover:bg-linear-card"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {children}
      </div>
    </div>
  )
}