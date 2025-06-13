# Vercel Environment Setup

## RevenueCat Configuration

After updating your environment variables to use the `VITE_` prefix, you need to configure them in Vercel for production and preview deployments.

### Prerequisites

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Link your project: `vercel link`

### Environment Variable Setup

```bash
# First, add Supabase URL secret and link it
npx vercel secrets add vite_supabase_url https://przjeunffnkjzxpykvjn.supabase.co
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_URL preview

# Add platform-specific RevenueCat keys
# iOS key (starts with appl_)
npx vercel secrets add vite_revenuecat_ios_key appl_dJsnXzyTgEAsntJQjOxeOvOnoXP
vercel env add VITE_REVENUECAT_IOS_KEY production
vercel env add VITE_REVENUECAT_IOS_KEY preview

# Web/Stripe key (starts with strp_)
npx vercel secrets add vite_revenuecat_web_key strp_kPUxxTPVLFHFRUapUTafrHwSMAE
vercel env add VITE_REVENUECAT_WEB_KEY production
vercel env add VITE_REVENUECAT_WEB_KEY preview

# Legacy key (can be removed after migration)
npx vercel secrets add vite_revenuecat_public_key public_live_XXXXXXXXXXXXXXXX
vercel env add VITE_REVENUECAT_PUBLIC_KEY production
vercel env add VITE_REVENUECAT_PUBLIC_KEY preview
```

When prompted, enter your RevenueCat public key:

- iOS keys start with `appl_`
- Web/Stripe keys start with `strp_` or `public_`

### Alternative: Vercel Dashboard

You can also set these via the Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `VITE_REVENUECAT_IOS_KEY` with your iOS key (appl\_...)
   - `VITE_REVENUECAT_WEB_KEY` with your Web/Stripe key (strp\_...)
   - `VITE_REVENUECAT_PUBLIC_KEY` (legacy, can be removed later)
4. Select the appropriate environments (Production, Preview, Development)

### Verification

After deployment, verify the key is properly set:

```bash
# Check environment variables are set
vercel env ls

# Validate RevenueCat configuration in your app
npm run revenuecat:validate
```

### Important Notes

- ⚠️ **Never use secret keys**: Ensure your key starts with `public_` or `appl_`, not `sk_`
- 🔄 **Redeploy after changes**: Environment variable changes require a new deployment
- 🧪 **Test both environments**: Verify functionality in both preview and production

### Troubleshooting

If you see "RevenueCat public key not set" errors after deployment:

1. Verify the environment variable is set: `vercel env ls`
2. Check the key format (should start with `public_` or `appl_`)
3. Trigger a new deployment: `vercel --prod`
4. Check the RevenueCat debug panel in your app's settings
