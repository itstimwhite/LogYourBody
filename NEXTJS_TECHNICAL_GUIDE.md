# Next.js Technical Implementation Guide

## Quick Start Commands

```bash
# Create Next.js app in parallel
npx create-next-app@latest next-app --typescript --tailwind --app --src-dir --import-alias "@/*"

# Install required dependencies
cd next-app
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
npm install @tanstack/react-query @trpc/server @trpc/client @trpc/react-query @trpc/next
npm install @capacitor/core @capacitor/ios
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-slot lucide-react
```

## Environment Variables Migration

```env
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# API URLs for Capacitor
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_PRODUCTION_API_URL=https://api.logyourbody.com
```

## Key File Conversions

### 1. Layout Migration (App.tsx → layout.tsx)

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
```

### 2. Providers Setup

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { useState } from 'react'

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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

### 3. Server-Side Auth Setup

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  )
}
```

### 4. tRPC Setup

```typescript
// server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { createClient } from '@/lib/supabase/server'
import superjson from 'superjson'

const t = initTRPC.create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ next }) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      user,
      supabase,
    },
  })
})
```

### 5. API Route Handler

```typescript
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
```

### 6. Weight Logging API

```typescript
// server/api/routers/weight.ts
import { z } from 'zod'
import { router, protectedProcedure } from '@/server/api/trpc'

export const weightRouter = router({
  create: protectedProcedure
    .input(z.object({
      weight: z.number(),
      bodyFatPercentage: z.number(),
      method: z.enum(['dexa', 'scale', 'calipers', 'visual']),
      date: z.string(),
      photoUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('body_metrics')
        .insert({
          user_id: ctx.user.id,
          ...input,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ 
        code: 'INTERNAL_SERVER_ERROR', 
        message: error.message 
      })

      return data
    }),

  list: protectedProcedure
    .input(z.object({
      limit: z.number().default(30),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('date', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (error) throw new TRPCError({ 
        code: 'INTERNAL_SERVER_ERROR', 
        message: error.message 
      })

      return data
    }),
})
```

### 7. Client-Side tRPC Hook

```typescript
// lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/api/root'

export const api = createTRPCReact<AppRouter>()

// Usage in components
export function WeightLogger() {
  const createWeight = api.weight.create.useMutation({
    onSuccess: () => {
      toast.success('Weight logged successfully!')
    },
  })

  const handleSubmit = (data: WeightData) => {
    createWeight.mutate(data)
  }
}
```

### 8. Capacitor Detection & Routing

```typescript
// lib/capacitor.ts
import { Capacitor } from '@capacitor/core'

export const isCapacitor = () => Capacitor.isNativePlatform()

export const getApiUrl = () => {
  if (isCapacitor()) {
    return process.env.NEXT_PUBLIC_PRODUCTION_API_URL
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api'
}

// hooks/use-cap-navigation.ts
import { useRouter } from 'next/navigation'
import { isCapacitor } from '@/lib/capacitor'

export function useCapNavigation() {
  const router = useRouter()

  const navigate = (path: string) => {
    if (isCapacitor()) {
      // For Capacitor, use full page reload
      window.location.href = path
    } else {
      // For web, use Next.js navigation
      router.push(path)
    }
  }

  return { navigate }
}
```

### 9. Static Export Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_TARGET === 'capacitor' ? 'export' : undefined,
  images: {
    unoptimized: process.env.BUILD_TARGET === 'capacitor',
  },
  trailingSlash: true,
  // Capacitor requires relative paths
  assetPrefix: process.env.BUILD_TARGET === 'capacitor' ? './' : undefined,
}

module.exports = nextConfig
```

### 10. Build Scripts

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:capacitor": "BUILD_TARGET=capacitor next build",
    "export:capacitor": "BUILD_TARGET=capacitor next export -o capacitor-dist",
    "cap:copy": "npm run build:capacitor && npm run export:capacitor && cap copy",
    "cap:sync": "npm run cap:copy && cap sync",
    "cap:build:ios": "npm run cap:sync && cap open ios"
  }
}
```

## Common Gotchas & Solutions

### 1. Hydration Errors
```typescript
// Use dynamic imports for client-only components
const HealthKitSync = dynamic(
  () => import('@/components/HealthKitSync'),
  { ssr: false }
)
```

### 2. Capacitor API Calls
```typescript
// Always use absolute URLs in Capacitor
const apiUrl = isCapacitor() 
  ? 'https://logyourbody.com/api' 
  : '/api'
```

### 3. File Uploads
```typescript
// Handle both web and native file uploads
export async function uploadPhoto(file: File | string) {
  if (typeof file === 'string') {
    // Capacitor photo (base64 or file:// URL)
    const blob = await fetch(file).then(r => r.blob())
    return uploadToSupabase(blob)
  } else {
    // Web File object
    return uploadToSupabase(file)
  }
}
```

### 4. Authentication Redirects
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Skip middleware for Capacitor builds
  if (request.headers.get('x-capacitor')) {
    return NextResponse.next()
  }
  
  // Normal auth checks for web
}
```

## Testing Strategy

```bash
# Test web version
npm run dev

# Test Capacitor build
npm run build:capacitor
npx serve out -p 3001

# Test in iOS Simulator
npm run cap:build:ios
```

## Monitoring & Analytics

```typescript
// lib/analytics.ts
export function trackEvent(event: string, properties?: any) {
  if (isCapacitor()) {
    // Use native analytics
    CapacitorAnalytics.track(event, properties)
  } else {
    // Use web analytics (Vercel, etc.)
    window.analytics?.track(event, properties)
  }
}
```