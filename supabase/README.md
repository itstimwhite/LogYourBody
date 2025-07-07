# Supabase Configuration

This directory contains the unified Supabase configuration for both the iOS and web applications.

## Structure

```
supabase/
├── config.toml          # Supabase configuration
├── migrations/          # Database migrations (shared by all apps)
├── functions/           # Edge functions
├── deploy.sh           # Deployment script
└── .temp/              # Temporary files (git ignored)
```

## Setup

1. **Install Supabase CLI**:
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Link your project**:
   ```bash
   cd supabase
   supabase link --project-ref <your-project-ref>
   ```

3. **Deploy**:
   ```bash
   ./deploy.sh
   ```

## Important Notes

- Both iOS and web apps share the same database schema
- The storage bucket is named `photos` (not `progress-photos`)
- All migrations should be added to the `migrations/` directory here
- Edge functions from individual apps are copied during deployment

## Migration Naming Convention

Use the format: `YYYYMMDD_HHMMSS_description.sql`

Example: `20250706_120000_add_photo_fields.sql`

## Storage Configuration

The `photos` bucket is configured with:
- Public access (for processed images)
- 50MB file size limit
- Allowed types: JPEG, PNG, HEIC, HEIF, WebP
- RLS policies ensure users can only access their own photos