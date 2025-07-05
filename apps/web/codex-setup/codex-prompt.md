# LogYourBody Project Context for AI Assistants

## Project Overview
LogYourBody is a modern, privacy-focused body composition tracking application built with Next.js 15, TypeScript, and Supabase. It helps users track their fitness progress through body metrics, progress photos, and advanced calculations like FFMI (Fat-Free Mass Index).

## Technical Stack
- **Frontend**: Next.js 15.3.3 (App Router), React 18, TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI based)
- **Authentication**: Supabase Auth with SMS support via Twilio
- **Mobile**: Progressive Web App + Capacitor for iOS
- **Testing**: Jest, React Testing Library, Playwright

## Key Features
1. **Body Metrics Tracking**: Weight, body fat %, lean mass, FFMI
2. **Multiple Measurement Methods**: Navy, 3-site, 7-site skinfold
3. **Progress Photos**: Secure storage and timeline visualization
4. **Data Import**: PDF parsing for DXA/BodPod scans using OpenAI
5. **Avatar Generation**: Visual representation based on body fat %
6. **Timeline View**: Interactive data visualization with interpolation
7. **Goal Setting**: Research-based targets for body composition
8. **Offline Support**: PWA with service worker caching

## Architecture Patterns
- **Server Components**: Default for all pages unless client interactivity needed
- **Client Components**: Marked with 'use client' for interactive features
- **API Routes**: Located in `src/app/api/` for server-side operations
- **Database Access**: Always through Supabase client (server or client)
- **Type Safety**: Strict TypeScript with comprehensive type definitions

## File Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   └── dashboard/         # Main app pages
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Core libraries
│   └── supabase/         # Database client setup
├── utils/                 # Helper functions
├── types/                 # TypeScript definitions
├── contexts/             # React Context providers
└── hooks/                # Custom React hooks
```

## Database Schema
- **user_profiles**: User settings and physical attributes
- **body_metrics**: Weight and body composition measurements
- **progress_photos**: Photo metadata and storage references
- **daily_metrics**: Step count and activity data
- **user_goals**: Target metrics for body composition

## Coding Guidelines
1. **Components**: Use functional components with TypeScript
2. **State Management**: React hooks and Context API
3. **Styling**: Tailwind utility classes, avoid inline styles
4. **Error Handling**: Try-catch blocks with user-friendly messages
5. **Loading States**: Always show loading indicators
6. **Accessibility**: Use semantic HTML and ARIA labels

## Common Patterns

### Supabase Query Example:
```typescript
const { data, error } = await supabase
  .from('body_metrics')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false })
  .limit(10)
```

### Component Structure:
```typescript
'use client' // Only if needed

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ComponentProps {
  // Define props
}

export function ComponentName({ props }: ComponentProps) {
  // Component logic
  return (
    // JSX with Tailwind classes
  )
}
```

### API Route Pattern:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  // Handle request
  return NextResponse.json({ data })
}
```

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `OPENAI_API_KEY`: For PDF parsing functionality
- `TWILIO_*`: SMS authentication configuration

## Testing Approach
- Unit tests for utilities and calculations
- Component tests for UI behavior
- Integration tests for API routes
- E2E tests for critical user flows

## Performance Considerations
- Use React.Suspense for code splitting
- Implement virtual scrolling for large lists
- Optimize images with Next.js Image component
- Cache API responses appropriately

## Security Best Practices
- Never expose sensitive keys in client code
- Use Row Level Security for all database tables
- Validate all user inputs
- Sanitize data before storage
- Use HTTPS for all external requests

When working on this project, prioritize:
1. Type safety and proper TypeScript usage
2. Responsive design for mobile devices
3. Accessibility for all users
4. Performance optimization
5. Clear, maintainable code structure