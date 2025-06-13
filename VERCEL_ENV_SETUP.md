# Vercel Environment Setup

## RevenueCat Configuration

After updating your environment variables to use the `VITE_` prefix, you need to configure them in Vercel for production and preview deployments.

### Prerequisites

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Link your project: `vercel link`

### Environment Variable Setup

Run these commands to add the RevenueCat public key to all Vercel environments:

```bash
# Add to production environment
vercel env add VITE_REVENUECAT_PUBLIC_KEY production

# Add to preview environment  
vercel env add VITE_REVENUECAT_PUBLIC_KEY preview

# Add to development environment (optional - usually uses local .env)
vercel env add VITE_REVENUECAT_PUBLIC_KEY development
```

When prompted, enter your RevenueCat public key (starts with `public_` or `appl_`).

### Alternative: Vercel Dashboard

You can also set these via the Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add `VITE_REVENUECAT_PUBLIC_KEY` with your public key
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