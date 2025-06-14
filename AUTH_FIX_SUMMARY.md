# Auth System Fix Summary

## Root Cause
The authentication was failing because a database trigger `sync_user_email_subscriptions_trigger` was trying to update a non-existent table `email_subscriptions`. This caused the auth transaction to abort with the error "Database error creating new user".

## Solution Applied

1. **Removed the problematic trigger** (`REMOVE_EMAIL_SUBSCRIPTION_TRIGGER.sql`)
   - Dropped `sync_user_email_subscriptions_trigger` 
   - Dropped `sync_user_email_subscriptions()` function

2. **Fixed the code** 
   - Removed `syncEmailSubscriptions` from AuthContext.tsx
   - Removed unused `use-email-sync.tsx` hook

3. **Cleaned up**
   - Removed all debug SQL files (20+ files)
   - Removed debug React components
   - Restored TestAuth page to original state

## To Complete Setup

Run these SQL scripts in order in your Supabase SQL Editor:

1. **If you haven't already:** Run `REMOVE_EMAIL_SUBSCRIPTION_TRIGGER.sql` to fix the auth issue
2. **Now run:** `RESTORE_AUTH_SYSTEM.sql` to restore the original user creation trigger

## What the Original Trigger Does

The `handle_new_user()` trigger automatically creates:
- User profile with name, email, gender, height
- User settings with default units (imperial)
- Trial subscription (3 days)

This runs automatically when a new user signs up.

## Files to Keep

- `REMOVE_EMAIL_SUBSCRIPTION_TRIGGER.sql` - Documents the fix
- `RESTORE_AUTH_SYSTEM.sql` - Restores original functionality
- This summary file

All other debug files have been removed.