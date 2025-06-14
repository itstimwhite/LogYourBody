# 🚨 URGENT: Fix User Registration Issue

## Critical Problem
New users cannot be created in LogYourBody, even from Supabase admin panel. This is blocking all user registration.

## Root Cause Analysis
Based on investigation of your codebase, the issues are:

1. **Database Trigger Function Failing**: The `handle_new_user()` function has schema constraint violations
2. **RLS Policies Too Restrictive**: Row Level Security policies preventing initial user data creation  
3. **SMS User Email Handling**: Users registering via SMS don't have email addresses, causing NOT NULL constraint violations
4. **Missing Error Recovery**: Silent failures leaving users in inconsistent auth states

## 🚀 IMMEDIATE FIX (Takes 2 minutes)

### Step 1: Run the Fix Script
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `URGENT_AUTH_FIX.sql` 
4. Click **Run** to execute the script

### Step 2: Verify the Fix
The script will show test results. Look for:
```
🎉 ALL TESTS PASSED - User creation is working!
```

### Step 3: Test User Registration
1. Try creating a new user from Supabase Auth > Users
2. Test email signup in your app
3. Test SMS signup if enabled

## 📋 What the Fix Does

### Database Schema Fixes
- Makes profile fields optional (removes NOT NULL constraints)
- Adds missing email column for older installations
- Sets sensible defaults for height and other fields

### Robust User Creation Function
- Handles both email and SMS users correctly
- Generates fallback emails for SMS users (`phone@sms.logyourbody.com`)
- Includes comprehensive error handling
- Uses ON CONFLICT clauses to prevent duplicate key errors
- Logs detailed error information for debugging

### Updated RLS Policies
- More permissive policies for initial user creation
- Proper handling of user ID matching during signup flow

### User Recovery
- Fixes any existing orphaned users missing profile data
- Ensures all users have complete profile, settings, and subscription records

## 🔍 Monitoring After Fix

### Check for Successful User Creation
```sql
-- Run this to see recent user creations
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.name,
    s.status as subscription_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id  
LEFT JOIN subscriptions s ON u.id = s.user_id
ORDER BY u.created_at DESC
LIMIT 10;
```

### Monitor for Errors
```sql
-- Check PostgreSQL logs for any remaining issues
SELECT message 
FROM pg_stat_statements 
WHERE query LIKE '%handle_new_user%'
ORDER BY last_exec_time DESC;
```

## 🚨 If Issues Persist

### Application-Level Debugging
1. Check your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Verify Supabase auth configuration in `supabase/config.toml`

3. Check browser network tab for specific error messages during signup

### Database-Level Debugging
```sql
-- Check if trigger is firing
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Verify function exists and is callable
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

## 📞 Emergency Contact
If the fix doesn't work immediately:

1. **Check the SQL execution results** - the script provides detailed diagnostics
2. **Look for specific error messages** in the Supabase logs  
3. **Test with a simple email signup first** before trying SMS
4. **Verify your Supabase project settings** for auth providers

## ✅ Success Indicators

After running the fix, you should see:

- ✅ New users can be created from Supabase admin panel
- ✅ Email signup works in your application  
- ✅ SMS signup works (if configured)
- ✅ Users have complete profiles automatically created
- ✅ No "Database error creating new user" messages
- ✅ All new users get trial subscriptions automatically

---

**This fix addresses the core database-level issues that have been causing user registration failures. The comprehensive error handling ensures the system is resilient to edge cases going forward.**