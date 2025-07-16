# GitHub Environments Setup Guide

This guide explains how to set up GitHub environments for the LogYourBody project.

## Required Environments

### 1. Development Environment
- **Name**: `development`
- **Branch**: `dev`
- **Purpose**: Development builds and testing
- **Auto-deploy**: Yes

### 2. Preview Environment  
- **Name**: `preview`
- **Branch**: `preview`
- **Purpose**: TestFlight beta releases
- **Auto-deploy**: Yes (after dev merge)

### 3. Production Environment
- **Name**: `production`
- **Branch**: `main`
- **Purpose**: App Store releases
- **Auto-deploy**: No (manual approval required)

## Setup Steps

### 1. Create Environments in GitHub

1. Go to your repository settings
2. Click on "Environments" in the left sidebar
3. Click "New environment" for each environment

### 2. Configure Each Environment

#### Development Environment
- **Name**: `development`
- **Environment URL**: (optional)
- **Required reviewers**: None
- **Deployment branches**: Only `dev` branch

#### Preview Environment
- **Name**: `preview`
- **Environment URL**: (optional)
- **Required reviewers**: None (or add reviewers if needed)
- **Deployment branches**: Only `preview` branch

#### Production Environment
- **Name**: `production`
- **Environment URL**: https://apps.apple.com/app/idXXXXXXXXX
- **Required reviewers**: Add 1-2 reviewers
- **Deployment branches**: Only `main` branch
- **Protection rules**:
  - ✅ Required reviewers
  - ✅ Prevent self-review
  - Wait timer: 5 minutes (optional)

### 3. Add Environment Secrets

Add these secrets to each environment as appropriate:

#### All Environments
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

#### Preview & Production Only
- `APPLE_ID_EMAIL`
- `APPLE_ID_PASSWORD`
- `APPLE_TEAM_ID`
- `APP_STORE_APP_ID`
- `IOS_P12_BASE64`
- `IOS_P12_PASSWORD`
- `IOS_PROVISIONING_PROFILE_BASE64`
- `IOS_PROVISIONING_PROFILE_NAME`
- `IOS_CODE_SIGN_IDENTITY`

#### Production Only
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_BASE64`

## Environment Variables Structure

```yaml
# Development
development:
  NEXT_PUBLIC_SUPABASE_URL: "https://dev.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "dev-key"
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_dev"

# Preview
preview:
  NEXT_PUBLIC_SUPABASE_URL: "https://staging.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "staging-key"
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_staging"
  # + All iOS deployment secrets

# Production
production:
  NEXT_PUBLIC_SUPABASE_URL: "https://prod.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "prod-key"
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_prod"
  # + All iOS deployment secrets
  # + App Store Connect API keys
```

## Benefits

1. **Security**: Secrets are scoped to specific environments
2. **Control**: Production requires manual approval
3. **Visibility**: Clear deployment status in GitHub
4. **Audit**: Full deployment history and logs
5. **Rollback**: Easy to revert to previous versions

## Deployment Flow

```
dev branch → development environment (auto)
     ↓
dev → preview (auto-merge on success)
     ↓
preview branch → preview environment (auto) → TestFlight
     ↓
preview → main (manual PR)
     ↓
main branch → production environment (manual approval) → App Store
```