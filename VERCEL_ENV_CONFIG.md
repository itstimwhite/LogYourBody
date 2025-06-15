# Vercel Environment Configuration

## Environment-Specific Database Setup

Once you have your three Supabase databases set up, configure Vercel to use the correct database for each branch.

### Production Environment (main branch)

**Vercel Dashboard → Project → Settings → Environment Variables → Production**

```env
VITE_SUPABASE_URL=https://przjeunffnkjzxpykvjn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByempldW5mZm5ranp4cHlrdmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTI1NDYsImV4cCI6MjA2NDk4ODU0Nn0.jZyohfzoydZKaSH_q0Tu4VqEbyFDdf-8i0kSm-YzB8w
VITE_REVENUECAT_IOS_KEY=appl_dJsnXzyTgEAsntJQjOxeOvOnoXP
VITE_REVENUECAT_WEB_KEY=strp_kPUxxTPVLFHFRUapUTafrHwSMAE
VITE_REVENUECAT_PUBLIC_KEY=appl_dJsnXzyTgEAsntJQjOxeOvOnoXP
```

### Preview Environment (preview branch)

**Vercel Dashboard → Project → Settings → Environment Variables → Preview**

```env
VITE_SUPABASE_URL=https://[PREVIEW-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[PREVIEW-ANON-KEY]
VITE_REVENUECAT_IOS_KEY=appl_dJsnXzyTgEAsntJQjOxeOvOnoXP
VITE_REVENUECAT_WEB_KEY=strp_kPUxxTPVLFHFRUapUTafrHwSMAE
VITE_REVENUECAT_PUBLIC_KEY=appl_dJsnXzyTgEAsntJQjOxeOvOnoXP
```

### Development Environment (dev branch)

**Vercel Dashboard → Project → Settings → Environment Variables → Development**

```env
VITE_SUPABASE_URL=https://[DEV-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[DEV-ANON-KEY]
VITE_REVENUECAT_IOS_KEY=appl_dJsnXzyTgEAsntJQjOxeOvOnoXP
VITE_REVENUECAT_WEB_KEY=strp_kPUxxTPVLFHFRUapUTafrHwSMAE
VITE_REVENUECAT_PUBLIC_KEY=appl_dJsnXzyTgEAsntJQjOxeOvOnoXP
```

## Git Branch Configuration

**Vercel Dashboard → Project → Settings → Git**

```
Production Branch: main
Preview Branches: preview
Development Branch: dev
```

## Deployment Configuration

### Branch-Specific Builds

Each branch will automatically deploy to its corresponding environment:

- **main** → Production → `logyourbody.com`
- **preview** → Preview → `preview-logyourbody.vercel.app`  
- **dev** → Development → `dev-logyourbody.vercel.app`

### Build Commands

All environments use the same build command but with different environment variables:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci"
}
```

## Testing the Setup

### 1. Test Development Environment
```bash
git checkout dev
git add . && git commit -m "test: verify dev database connection"
git push origin dev
```

Check deployment at `https://[your-project]-git-dev-[your-username].vercel.app`

### 2. Test Preview Environment  
```bash
git checkout preview
git merge dev --no-ff
git push origin preview
```

Check deployment at `https://[your-project]-git-preview-[your-username].vercel.app`

### 3. Test Production Environment
```bash
git checkout main
git merge preview --no-ff  
git push origin main
```

Check deployment at `https://[your-domain].com`

## Environment Verification

Add this component to verify which database you're connected to:

```typescript
// src/components/DatabaseStatus.tsx
import { useSupabase } from '@/hooks/use-supabase';

export function DatabaseStatus() {
  const supabase = useSupabase();
  const dbUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // Extract project ref from URL
  const projectRef = dbUrl?.split('//')[1]?.split('.')[0];
  
  let environment = 'Unknown';
  if (projectRef === 'przjeunffnkjzxpykvjn') environment = 'Production';
  else if (projectRef?.includes('preview')) environment = 'Preview';
  else if (projectRef?.includes('dev')) environment = 'Development';
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-xs">
      🗄️ {environment} DB ({projectRef})
    </div>
  );
}
```

## Security Notes

### API Key Management
- **Production keys**: Keep secure, rotate regularly
- **Preview keys**: Can be shared with staging team
- **Development keys**: Can be in repository for team access

### Database Access
- **Production**: Only production deployments
- **Preview**: Only preview deployments + staging team
- **Development**: Only development deployments + developers

### Monitoring
- Set up alerts for each database separately
- Monitor usage limits on free tier projects
- Track API usage per environment

## Troubleshooting

### Wrong Database Connection
```bash
# Check current environment variables
vercel env ls

# Pull environment variables locally  
vercel env pull .env.vercel

# Check which database is being used
grep VITE_SUPABASE_URL .env.vercel
```

### Migration Issues
```bash
# Push migrations to specific database
supabase link --project-ref [project-ref]
supabase db push --password [db-password]
```

### Environment Variable Issues
1. Clear Vercel cache: `vercel --prod --force`
2. Re-deploy specific branch
3. Check environment variable scope (Production/Preview/Development)

This setup ensures each branch deploys to its corresponding database environment safely.