'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'
// import { ClerkProvider } from '@clerk/nextjs'
// import { ClerkAuthProvider } from '@/contexts/ClerkAuthContext'
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
        <PWAProvider>
          {children}
        </PWAProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}