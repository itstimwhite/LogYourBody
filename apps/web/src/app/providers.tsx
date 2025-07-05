'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { ClerkAuthProvider } from '@/contexts/ClerkAuthContext'
import { PWAProvider } from '@/components/PWAProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClerkAuthProvider>
            <PWAProvider>
              {children}
            </PWAProvider>
          </ClerkAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}