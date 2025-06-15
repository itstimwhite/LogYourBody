# Supabase Multi-Environment Setup Guide

## Current Situation
You're currently using the same Supabase project (`przjeunffnkjzxpykvjn`) across all environments (dev, preview, production). This is not ideal for data isolation and testing.

## Recommended Setup

### 1. Three Separate Supabase Projects

Create three separate Supabase projects in your dashboard:

#### Production Database (Keep Current)
- **Project Name**: `LogYourBody-Production`
- **URL**: `https://przjeunffnkjzxpykvjn.supabase.co` (keep current)
- **Usage**: Production traffic only
- **Data**: Real user data

#### Preview/Staging Database (New)
- **Project Name**: `LogYourBody-Preview`
- **URL**: `https://[new-ref].supabase.co`
- **Usage**: Testing features before production
- **Data**: Test data that mirrors production structure

#### Development Database (New)  
- **Project Name**: `LogYourBody-Development`
- **URL**: `https://[new-ref].supabase.co`
- **Usage**: Active development and experimentation
- **Data**: Development/testing data

### 2. Schema Synchronization Strategy

#### Option A: Manual Migration (Recommended)
1. Create new Preview and Development projects
2. Run your existing migrations on each new project
3. Seed with test data appropriate for each environment

#### Option B: Database Branching (Supabase Pro)
If you have Supabase Pro, you can use database branching:
- Create branches from your production database
- Each branch gets its own URL and can diverge independently

## Implementation Steps

### Step 1: Create New Supabase Projects

1. **Go to Supabase Dashboard** → Create New Project
2. **Create Preview Project**:
   - Name: `LogYourBody-Preview`
   - Region: Same as production (for consistency)
   - Database Password: Use a strong password (save it securely)

3. **Create Development Project**:
   - Name: `LogYourBody-Development`  
   - Region: Same as production
   - Database Password: Use a strong password (save it securely)

### Step 2: Configure Environment Variables

Update your environment files with the new database URLs:

#### `.env` (Development)
```env
# Development Database
VITE_SUPABASE_URL=https://[dev-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[dev-anon-key]
SUPABASE_URL=https://[dev-ref].supabase.co
SUPABASE_ANON_KEY=[dev-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[dev-service-key]
```

#### `.env.local` (Preview/Staging)
```env
# Preview Database
VITE_SUPABASE_URL="https://[preview-ref].supabase.co"
VITE_SUPABASE_ANON_KEY="[preview-anon-key]"
SUPABASE_URL="https://[preview-ref].supabase.co"
SUPABASE_ANON_KEY="[preview-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[preview-service-key]"
```

#### `.env.production` (Production)
```env
# Production Database (Current)
VITE_SUPABASE_URL=https://przjeunffnkjzxpykvjn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByempldW5mZm5ranp4cHlrdmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTI1NDYsImV4cCI6MjA2NDk4ODU0Nn0.jZyohfzoydZKaSH_q0Tu4VqEbyFDdf-8i0kSm-YzB8w
```

### Step 3: Migrate Database Schema

For each new project (Preview and Development):

1. **Copy Migration Files**:
   ```bash
   # Run migrations on each new database
   npx supabase login
   npx supabase link --project-ref [preview-ref]
   npx supabase db push --password [preview-db-password]
   
   npx supabase link --project-ref [dev-ref]  
   npx supabase db push --password [dev-db-password]
   ```

2. **Verify Schema**:
   - Check that all tables, views, functions are created
   - Verify RLS policies are in place
   - Test authentication flows

### Step 4: Update Vercel Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

#### Production Environment
```
VITE_SUPABASE_URL=https://przjeunffnkjzxpykvjn.supabase.co
VITE_SUPABASE_ANON_KEY=[production-anon-key]
```

#### Preview Environment  
```
VITE_SUPABASE_URL=https://[preview-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[preview-anon-key]
```

#### Development Environment
```
VITE_SUPABASE_URL=https://[dev-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[dev-anon-key]
```

### Step 5: Configure Branch-Specific Deployments

Update your deployment configuration to use the correct database per branch:

#### Vercel Configuration
1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Set Environment-Specific Variables**:
   - **Production** (main branch): Production Supabase project
   - **Preview** (preview branch): Preview Supabase project  
   - **Development** (dev branch): Development Supabase project

### Step 6: Test Data Management

#### Development Database
- Use synthetic test data
- Can be reset/wiped frequently
- Include edge cases and test scenarios

#### Preview Database  
- Use production-like data (anonymized)
- More stable than development
- Used for final testing before production

#### Production Database
- Real user data
- Never use for testing
- Protected with backups and monitoring

## Migration Script

Here's a script to help migrate your schema to new databases:

```bash
#!/bin/bash
# migrate-to-new-supabase.sh

echo "🔄 Setting up multi-environment Supabase databases..."

# Preview Database
echo "📋 Setting up Preview database..."
npx supabase login
read -p "Enter Preview project ref: " PREVIEW_REF
read -s -p "Enter Preview database password: " PREVIEW_PASSWORD
echo ""

npx supabase link --project-ref $PREVIEW_REF
npx supabase db push --password $PREVIEW_PASSWORD

echo "✅ Preview database setup complete"

# Development Database  
echo "📋 Setting up Development database..."
read -p "Enter Development project ref: " DEV_REF
read -s -p "Enter Development database password: " DEV_PASSWORD
echo ""

npx supabase link --project-ref $DEV_REF
npx supabase db push --password $DEV_PASSWORD

echo "✅ Development database setup complete"

echo "🎉 Multi-environment setup complete!"
echo "Next steps:"
echo "1. Update environment variables in Vercel"
echo "2. Update local .env files"
echo "3. Test deployments on each branch"
```

## Benefits of This Setup

### 🔒 Data Isolation
- Development experiments don't affect production
- Preview testing uses separate data
- Production data stays secure

### 🧪 Safe Testing
- Test database migrations safely
- Validate schema changes in preview
- Rollback capabilities per environment

### 🚀 Deployment Confidence
- Each environment matches its database
- Clear promotion path: dev → preview → production
- Reduced risk of data corruption

### 📊 Monitoring & Analytics
- Environment-specific metrics
- Separate usage tracking
- Independent performance monitoring

## Alternative: Single Database with Environment Tables

If you prefer to keep one database but still separate environments:

### Option: Environment Prefixes
- Add environment prefixes to table names
- Use RLS policies to isolate data by environment
- Requires application code changes

**Example**:
```sql
-- Instead of: body_metrics
CREATE TABLE dev_body_metrics (...);
CREATE TABLE preview_body_metrics (...);  
CREATE TABLE prod_body_metrics (...);
```

**Not Recommended** because:
- More complex application logic
- Higher risk of cross-environment data leaks
- Harder to manage migrations
- Shared resource limits

## Security Considerations

### API Keys
- **Never share API keys** between environments
- **Rotate keys regularly** (especially development keys)
- **Use service role keys** only when necessary

### Access Control
- **Limit preview database access** to staging team
- **Restrict development database** to developers only
- **Monitor production access** closely

### Data Protection
- **Anonymize data** when copying to lower environments
- **Regular backups** for production only
- **GDPR compliance** considerations for user data

## Cost Optimization

### Free Tier Management
- Each Supabase project gets free tier limits
- Monitor usage across all projects
- Consider pausing development projects when not in use

### Resource Allocation
- **Production**: Full resources, monitoring, backups
- **Preview**: Moderate resources, basic monitoring
- **Development**: Minimal resources, no monitoring needed

This setup ensures clean separation between your development, staging, and production environments while maintaining data integrity and deployment safety.