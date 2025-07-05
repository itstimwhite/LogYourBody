# Database Migrations

This directory contains all database migrations for the LogYourBody application.

## Automated Migration Process

Migrations are automatically applied through our CI/CD pipeline:

- **Development**: Migrations run on `dev` branch pushes
- **Preview**: Migrations run on `preview` branch pushes  
- **Production**: Migrations run on `main` branch pushes (with extra verification)

## Creating a New Migration

Use the provided npm script to create a new migration:

```bash
npm run db:migrate "add user preferences"
```

This will create a timestamped migration file like:
`20250116120000_add_user_preferences.sql`

## Migration Guidelines

### Naming Convention
- Format: `YYYYMMDDHHMMSS_descriptive_name.sql`
- Use snake_case for the descriptive name
- Be specific about what the migration does

### Best Practices

1. **Always use IF EXISTS/IF NOT EXISTS**
   ```sql
   create table if not exists public.table_name (...);
   alter table public.table_name add column if not exists column_name;
   ```

2. **Make migrations idempotent**
   - Migrations should be safe to run multiple times
   - Check for existence before creating/dropping

3. **Include comments**
   ```sql
   -- Purpose: Add user preferences for notification settings
   -- Author: Your Name
   -- Date: 2025-01-16
   ```

4. **Test locally first**
   ```bash
   npm run db:push:local
   ```

5. **Consider rollback strategy**
   - Include commented-out DOWN migration
   - Document any data that would be lost

### Required GitHub Secrets

The following secrets must be configured in your GitHub repository:

- `DEV_DATABASE_URL`: Development database connection string
- `PREVIEW_DATABASE_URL`: Preview database connection string
- `PROD_DATABASE_URL`: Production database connection string
- `SUPABASE_ACCESS_TOKEN`: Supabase CLI access token

### Manual Migration

If you need to run migrations manually:

```bash
# Check current migration status
npm run db:status

# Push migrations to database
npm run db:push
```

## Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2025-01-16 | 20250116000000_create_user_profiles.sql | Initial user profiles and email subscriptions tables |

## Troubleshooting

### Migration Failed in CI
1. Check the GitHub Actions logs
2. An issue will be automatically created for failed migrations
3. Fix the migration and push again

### Local Testing
1. Set up local Supabase: `supabase start`
2. Test migration: `npm run db:push:local`
3. Reset if needed: `supabase db reset`

### Rolling Back
1. Create a new migration that undoes the changes
2. Never delete migration files from the repository
3. Document the rollback in the migration file