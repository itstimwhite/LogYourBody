# Vercel Deployment Checklist for LogYourBody Web App

## ✅ Build Configuration

The web app is configured and ready for Vercel deployment:

- **Framework**: Next.js 15.3.3
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

## ✅ Environment Variables

The following environment variables need to be configured in Vercel:

### Required Variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Database
POSTGRES_DATABASE=postgres
```

### Optional Variables:

```env
# RevenueCat (for subscriptions)
NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY=your-revenuecat-key

# OpenAI (for avatar generation)
OPENAI_API_KEY=your-openai-api-key-here

# Twilio (for SMS login)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Version (auto-populated in CI)
NEXT_PUBLIC_VERSION=production
```

## ✅ Vercel Project Settings

1. **Framework Preset**: Next.js (auto-detected)
2. **Node.js Version**: 18.x or 20.x recommended
3. **Root Directory**: `apps/web` (if deploying from monorepo root)
4. **Build & Development Settings**: Use defaults

## ✅ Domain Configuration

1. Add your custom domain in Vercel project settings
2. Configure DNS records as instructed by Vercel
3. Enable HTTPS (automatic with Vercel)

## ✅ Deployment Configuration

The `vercel.json` file is already configured with:
- Clean URLs enabled
- Proper caching headers for assets
- Git deployment enabled for `dev` and `main` branches
- Deployment ID headers

## ✅ Post-Deployment Checklist

1. **Verify Clerk Webhook**: 
   - Add Vercel deployment URL to Clerk webhook endpoints
   - Test webhook at `/api/webhooks/clerk`

2. **Test Authentication**:
   - Sign up flow
   - Sign in flow
   - OAuth providers (if configured)

3. **Test Supabase Connection**:
   - Data fetching
   - Data mutations
   - Real-time subscriptions

4. **Test File Uploads** (if using Supabase Storage):
   - Profile pictures
   - Progress photos

## 🚀 Deployment Commands

### Initial Setup:
```bash
# Install Vercel CLI globally
npm i -g vercel

# Link to Vercel project (from apps/web directory)
cd apps/web
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Automatic Deployments:
- Push to `dev` branch → Preview deployment
- Push to `main` branch → Production deployment

## 📋 Troubleshooting

### Build Failures:
1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Run `npm run build` locally to reproduce

### Runtime Errors:
1. Check function logs in Vercel dashboard
2. Verify environment variables are accessible
3. Check browser console for client-side errors

### Performance Issues:
1. Enable Vercel Analytics
2. Check Core Web Vitals
3. Optimize images and bundle size

## 🔒 Security Notes

- Never commit `.env` files
- Use Vercel's environment variable UI
- Rotate secrets regularly
- Enable Vercel's DDoS protection

---

Last Updated: January 2025
Build Status: ✅ All tests passing, no TypeScript errors