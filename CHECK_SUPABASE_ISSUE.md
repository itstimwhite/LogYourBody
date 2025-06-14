# Supabase Auth 500 Error Checklist

Based on the error log showing a 500 error on `/auth/v1/admin/users`, check these Supabase-specific issues:

## 1. Check Supabase Dashboard

### Authentication Settings
- Go to **Authentication → Providers**
- Ensure **Email** is ENABLED
- Check **Email Settings**:
  - Disable "Confirm email" for testing
  - Check "Enable email signup"

### Rate Limits
- Go to **Authentication → Rate Limits**
- Check if you've hit signup limits
- Default is often 3-5 signups per hour from same IP

### Project Status
- Go to **Settings → General**
- Ensure project is ACTIVE (not paused)
- Check you're not over database size limits

## 2. Known Supabase Issues

### Instance ID Problem
The error often occurs when `instance_id` in auth.users is NULL. Run:
```sql
SELECT instance_id, COUNT(*) 
FROM auth.users 
GROUP BY instance_id;
```

### Email Provider Issues
- Supabase uses a default email provider with strict limits
- After 3-4 test signups, you may be rate limited
- Solution: Wait 1 hour or use different email domains

### Database Connection Limits
- Free tier has connection limits
- Check: **Database → Settings → Connection Pooling**

## 3. Temporary Workarounds

### Option 1: Use Supabase Dashboard
1. Go to **Authentication → Users**
2. Click "Invite User"
3. Create user manually
4. Then run: `SELECT setup_user_data('user-id-here');`

### Option 2: Use Different Auth Method
Try SMS auth or Magic Link instead of password auth

### Option 3: Create New Project
If all else fails, the project's auth system may be corrupted. Create a new Supabase project.

## 4. Debug Information Needed

Run this query and share the results:
```sql
SELECT 
    version() as postgres_version,
    current_database() as database_name,
    COUNT(*) as total_users
FROM auth.users
GROUP BY version(), current_database();
```

## 5. Contact Supabase Support

If the issue persists:
1. Go to support.supabase.com
2. Include:
   - Project ID: `przjeunffnkjzxpykvjn`
   - Error: 500 unexpected_failure on /auth/v1/admin/users
   - Time: Check the logs for exact timestamp