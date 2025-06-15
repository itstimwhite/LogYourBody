# Route-by-Route Conversion Guide

## Current Routes → Next.js App Router

### 1. Landing Page
**Current**: `src/pages/Index.tsx`  
**Next.js**: `app/page.tsx`

```typescript
// app/page.tsx
import { LandingPage } from '@/components/LandingPage'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'LogYourBody - Track Your Body Composition',
  description: 'The simplest way to track your body composition over time',
}

export default function HomePage() {
  return (
    <>
      <LandingPage />
      <Footer />
    </>
  )
}
```

### 2. Login Page
**Current**: `src/pages/Login.tsx`  
**Next.js**: `app/(auth)/login/page.tsx`

```typescript
// app/(auth)/login/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LoginForm />
}

// app/(auth)/login/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  // Move your existing Login component logic here
  // This remains client-side for interactivity
}
```

### 3. Dashboard
**Current**: `src/pages/Dashboard.tsx`  
**Next.js**: `app/(protected)/dashboard/page.tsx`

```typescript
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}

// app/(protected)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch initial data server-side
  const [profile, metrics, settings] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('body_metrics').select('*').eq('user_id', user!.id).order('date', { ascending: false }).limit(30),
    supabase.from('user_settings').select('*').eq('user_id', user!.id).single(),
  ])

  return (
    <DashboardClient
      initialProfile={profile.data}
      initialMetrics={metrics.data || []}
      initialSettings={settings.data}
    />
  )
}
```

### 4. Settings
**Current**: `src/pages/Settings.tsx`  
**Next.js**: `app/(protected)/settings/page.tsx`

```typescript
// app/(protected)/settings/page.tsx
import { Suspense } from 'react'
import { SettingsSkeleton } from '@/components/settings/skeleton'
import { SettingsContent } from './settings-content'

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  )
}

// app/(protected)/settings/settings-content.tsx
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './settings-client'

export async function SettingsContent() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <SettingsClient initialProfile={profile} />
}
```

### 5. Blog
**Current**: `src/pages/Blog.tsx`  
**Next.js**: `app/blog/page.tsx` (with SSG)

```typescript
// app/blog/page.tsx
import { getBlogPosts } from '@/lib/blog'
import Link from 'next/link'

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="border rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p className="text-muted-foreground mt-2">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)
  return <BlogPost post={post} />
}
```

### 6. API Routes for Weight Logging

```typescript
// app/api/weight/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  const { data, error } = await supabase
    .from('body_metrics')
    .insert({
      user_id: user.id,
      weight: body.weight,
      body_fat_percentage: body.bodyFatPercentage,
      method: body.method,
      date: body.date,
      photo_url: body.photoUrl,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
```

### 7. Photo Upload with Server Actions

```typescript
// app/(protected)/dashboard/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadProgressPhoto(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const file = formData.get('photo') as File
  const date = formData.get('date') as string

  // Upload to Supabase Storage
  const fileName = `${user.id}/${date}-${Date.now()}.jpg`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('progress-photos')
    .upload(fileName, file)

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('progress-photos')
    .getPublicUrl(fileName)

  // Update body metrics
  const { error: updateError } = await supabase
    .from('body_metrics')
    .update({ photo_url: publicUrl })
    .eq('user_id', user.id)
    .eq('date', date)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/dashboard')
  return { success: true, url: publicUrl }
}
```

## Route Migration Priority

### Phase 1 - Static Pages (Low Risk)
1. `/` → `app/page.tsx`
2. `/about` → `app/about/page.tsx`
3. `/privacy` → `app/privacy/page.tsx`
4. `/terms` → `app/terms/page.tsx`
5. `/careers` → `app/careers/page.tsx`

### Phase 2 - Blog (SEO Benefits)
6. `/blog` → `app/blog/page.tsx`
7. `/blog/:slug` → `app/blog/[slug]/page.tsx`

### Phase 3 - Auth Flow
8. `/login` → `app/(auth)/login/page.tsx`
9. Auth API routes → `app/api/auth/*`

### Phase 4 - Protected Routes
10. `/dashboard` → `app/(protected)/dashboard/page.tsx`
11. `/settings` → `app/(protected)/settings/page.tsx`
12. `/subscription` → `app/(protected)/subscription/page.tsx`

### Phase 5 - Complex Features
13. Weight logging flow → Client Components with Server Actions
14. HealthKit sync → Client-only with dynamic imports
15. Photo uploads → Server Actions + Storage

## Testing Each Migration

```bash
# After migrating each route:
1. Test in development: npm run dev
2. Build and test: npm run build && npm start
3. Test Capacitor: npm run build:capacitor
4. Check for hydration errors
5. Verify data fetching
6. Test auth redirects
7. Check SEO meta tags
```