# Next.js Migration Plan for LogYourBody

## Overview
This document outlines a phased migration strategy from the current Vite + React Router SPA to Next.js App Router, while maintaining Capacitor compatibility and preparing for future React Native migration.

## Current Architecture Analysis

### What We Have
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6 (client-side SPA)
- **Data Fetching**: Direct Supabase client calls in hooks
- **Auth**: Client-side Supabase Auth
- **Styling**: TailwindCSS + Radix UI components
- **Mobile**: Capacitor wrapper for iOS
- **State**: React Query + Context API
- **Deployment**: Vercel (static hosting)

### Key Challenges
1. All data fetching happens client-side
2. No API abstraction layer
3. SEO limitations (SPA)
4. Bundle size (entire app loads upfront)
5. No server-side auth validation

## Migration Strategy: Incremental Adoption

### Phase 1: Dual Setup (Week 1-2)
**Goal**: Run Next.js alongside existing Vite app

1. **Setup Next.js in parallel**
   ```bash
   npx create-next-app@latest next-app --typescript --tailwind --app
   ```

2. **Share components and utilities**
   - Create symlinks or monorepo structure
   - Share `/src/components/ui/*`
   - Share `/src/lib/utils.ts`
   - Share TailwindCSS config

3. **Maintain dual builds**
   - Vite app continues at root
   - Next.js app in `/next-app`
   - Both deploy to different Vercel projects initially

### Phase 2: Route Migration (Week 3-6)
**Goal**: Migrate routes incrementally, starting with static pages

#### Migration Order (Easiest → Hardest):
1. **Static Marketing Pages** (Week 3)
   - `/` (Landing page)
   - `/about`, `/privacy`, `/terms`, `/careers`
   - `/blog/*` - Great for SSG
   - Benefits: Better SEO, faster initial load

2. **Auth Pages** (Week 4)
   - `/login` - Server-side auth setup
   - Create API routes for auth
   - Implement middleware for protection

3. **Dashboard & Profile** (Week 5)
   - `/dashboard` - Convert to RSC with suspense
   - `/settings` - Mix of server/client components
   - Profile components with server data

4. **Interactive Features** (Week 6)
   - Weight logging flow
   - HealthKit sync (client-only)
   - Photo uploads

### Phase 3: API Layer Development (Week 7-8)
**Goal**: Build proper API abstraction

1. **Choose API Strategy**
   ```typescript
   // Option A: tRPC (Recommended)
   // app/api/trpc/[trpc]/route.ts
   export const appRouter = router({
     weight: weightRouter,
     auth: authRouter,
     profile: profileRouter,
   });

   // Option B: REST API Routes
   // app/api/weight/route.ts
   export async function POST(req: Request) {
     // Handle weight logging
   }
   ```

2. **Migrate Supabase calls**
   - Move database queries to server
   - Create typed API endpoints
   - Implement proper error handling

3. **Prepare for ChatGPT Plugin**
   - OpenAPI schema generation
   - Standardized response formats
   - Rate limiting & auth

### Phase 4: Capacitor Compatibility (Week 9)
**Goal**: Ensure Next.js works with Capacitor

1. **Static Export for Capacitor**
   ```javascript
   // next.config.js
   module.exports = {
     output: process.env.CAPACITOR_BUILD ? 'export' : 'standalone',
   }
   ```

2. **Handle Client-Side Navigation**
   - Detect Capacitor environment
   - Use client-side routing for native
   - Server-side for web

3. **API URL Configuration**
   ```typescript
   const API_URL = isCapacitor() 
     ? 'https://api.logyourbody.com' 
     : process.env.NEXT_PUBLIC_API_URL;
   ```

### Phase 5: Performance & Optimization (Week 10)
**Goal**: Optimize for production

1. **Implement ISR for Blog**
2. **Add Edge Runtime where applicable**
3. **Optimize images with next/image**
4. **Setup proper caching strategies**
5. **Add Server Actions for forms**

## Technical Implementation Details

### File Structure
```
logyourbody/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Protected routes
│   │   ├── dashboard/
│   │   ├── settings/
│   │   └── layout.tsx     # Auth check
│   ├── api/              # API routes
│   │   ├── trpc/
│   │   └── webhooks/
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Shared components
├── lib/                 # Utilities
└── next.config.js
```

### Key Code Patterns

#### Server Component with Suspense
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await getServerUser();
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard userId={user.id} />
    </Suspense>
  );
}
```

#### API Route with Supabase
```typescript
// app/api/weight/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Handle weight logging
}
```

#### Middleware for Auth
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}
```

## Capacitor Considerations

### Build Process
```json
// package.json
{
  "scripts": {
    "build:web": "next build",
    "build:cap": "CAPACITOR_BUILD=true next build && next export",
    "cap:sync": "npm run build:cap && cap sync"
  }
}
```

### Navigation Handling
```typescript
// hooks/use-navigation.ts
export function useNavigation() {
  const router = useRouter();
  const isNative = useIsCapacitor();
  
  const navigate = (path: string) => {
    if (isNative) {
      // Use Capacitor navigation
      window.location.href = path;
    } else {
      router.push(path);
    }
  };
  
  return { navigate };
}
```

## Migration Checklist

### Pre-Migration
- [ ] Backup current codebase
- [ ] Document all environment variables
- [ ] List all API endpoints needed
- [ ] Identify client-only components
- [ ] Plan rollback strategy

### During Migration
- [ ] Set up Next.js project structure
- [ ] Configure TypeScript paths
- [ ] Migrate TailwindCSS config
- [ ] Set up Supabase server clients
- [ ] Implement auth middleware
- [ ] Migrate static pages first
- [ ] Test Capacitor compatibility
- [ ] Set up API routes
- [ ] Migrate interactive features
- [ ] Configure deployment

### Post-Migration
- [ ] Performance testing
- [ ] SEO verification
- [ ] Capacitor build testing
- [ ] Update CI/CD pipelines
- [ ] Monitor error rates
- [ ] Document new patterns

## Risk Mitigation

1. **Maintain Feature Parity**
   - Run both apps in parallel initially
   - A/B test migrated routes
   - Quick rollback capability

2. **Capacitor Compatibility**
   - Test each migrated route in Capacitor
   - Maintain static export capability
   - Handle offline scenarios

3. **API Stability**
   - Version your APIs from day 1
   - Implement proper error handling
   - Monitor API performance

## Success Metrics

- [ ] 50% reduction in initial page load time
- [ ] SEO improvement (measurable via Google Search Console)
- [ ] Maintained Capacitor functionality
- [ ] API response times < 200ms
- [ ] Zero increase in error rates

## Timeline Summary

- **Weeks 1-2**: Setup and preparation
- **Weeks 3-6**: Route migration
- **Weeks 7-8**: API development
- **Week 9**: Capacitor compatibility
- **Week 10**: Optimization and launch

Total estimated time: 10 weeks for complete migration

## Next Steps

1. Create Next.js project structure
2. Set up shared component system
3. Begin with landing page migration
4. Establish API patterns early
5. Test Capacitor compatibility continuously