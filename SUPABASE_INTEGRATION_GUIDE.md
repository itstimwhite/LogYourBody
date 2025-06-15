# Supabase Integration Guide

## Overview
This guide outlines the comprehensive Supabase setup for LogYourBody, including multi-environment support and debugging tools.

## Database Status Component

A **DatabaseStatus** component has been added to the home page that displays:

### Real-time Information
- ✅ **Supabase Environment** (local/staging/production)
- ✅ **Vercel Environment** (development/preview/production)  
- ✅ **API Key Validation** (URL and Anon Key status)
- ✅ **Connection Test** (live database connectivity)
- ✅ **Environment Variables** (debugging info)

### Features
- 🔄 **Refresh Button** - Test connection on demand
- 👁️ **Show/Hide Keys** - View redacted API keys for debugging
- 📋 **Detailed View** - Environment variables and connection details
- 🎨 **Status Indicators** - Color-coded success/failure states

## Environment Setup

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Environment Detection Logic

The system automatically detects environments based on:

**Supabase Environment:**
- `local` - localhost/127.0.0.1 URLs
- `staging` - URLs containing 'staging' or 'preview'  
- `production` - URLs containing 'prod' or 'production'
- `unknown` - Unrecognized patterns

**Vercel Environment:**
- Uses `VERCEL_ENV` or falls back to `NODE_ENV`
- Automatically set by Vercel deployments

## Multi-Environment Strategy

### Recommended Setup
```
Production:  https://prod-project-id.supabase.co
Preview:     https://preview-project-id.supabase.co  
Development: https://dev-project-id.supabase.co
```

### Vercel Environment Variables
Set different Supabase URLs per environment:
- **Production**: Production Supabase project
- **Preview**: Staging Supabase project  
- **Development**: Development Supabase project

## Files Created

### Core Integration
- `src/lib/supabase/client.ts` - Client-side Supabase setup
- `src/lib/supabase/server.ts` - Server-side Supabase setup
- `src/components/DatabaseStatus.tsx` - Debug status component

### Configuration
- `.env.example` - Environment variable template
- `SUPABASE_INTEGRATION_GUIDE.md` - This documentation

## Connection Testing

The DatabaseStatus component performs live connection tests:

```typescript
// Tests basic database connectivity
const { data, error } = await supabase.from('_').select('*').limit(1)
```

## Key Validation

API keys are validated for:
- ✅ **Existence** - Environment variables are set
- ✅ **Format** - URLs start with https:// and contain 'supabase'
- ✅ **Length** - Anon keys are sufficiently long (>100 chars)

## Security Notes

- 🔒 API keys are redacted in display (first 20 chars + ...)
- 🔒 Only public (anon) keys are shown in client-side component
- 🔒 Service role keys are server-side only
- 🔒 Status component is development-only (will be removed pre-launch)

## Next Steps

1. **Set Environment Variables** - Add Supabase credentials to `.env.local`
2. **Test Connection** - Visit home page and check DatabaseStatus component
3. **Configure Vercel** - Set environment-specific variables in Vercel dashboard
4. **Set Up Auth** - Implement authentication flow using Supabase client
5. **Remove Debug Component** - Remove DatabaseStatus before production launch

## Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`

**"Database connection failed"** 
- Verify Supabase project is active
- Check API key permissions
- Test URL accessibility

**"Environment shows as 'unknown'"**
- URL doesn't match expected patterns
- Update `getSupabaseEnvironment()` logic in `client.ts`

### Debug Mode
The DatabaseStatus component provides detailed debugging info:
- Environment variable values
- Connection error messages  
- API key validation results
- Real-time connection status