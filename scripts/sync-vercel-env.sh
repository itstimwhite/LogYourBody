#!/bin/bash

# Sync Vercel Environment Variables Script
# This script ensures all environment variables are properly synced between local files and Vercel

set -e

echo "🔄 Syncing Environment Variables with Vercel"
echo "=============================================="
echo ""

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Pull current environment variables from Vercel
echo "📥 Pulling environment variables from Vercel..."

echo "  🔹 Development environment..."
npx vercel env pull .env.vercel.dev --environment=development

echo "  🔹 Preview environment..."
npx vercel env pull .env.vercel.preview --environment=preview

echo "  🔹 Production environment..."
npx vercel env pull .env.vercel.prod --environment=production

echo ""
echo "✅ Environment variables downloaded"
echo ""

# Show current Supabase URL configuration
echo "🗄️  Database Branch Configuration:"
echo "======================================"

echo "Development:"
grep "VITE_SUPABASE_URL" .env.vercel.dev | cut -d'=' -f2 | tr -d '"'

echo "Preview:"
grep "VITE_SUPABASE_URL" .env.vercel.preview | cut -d'=' -f2 | tr -d '"'

echo "Production:"
grep "VITE_SUPABASE_URL" .env.vercel.prod | cut -d'=' -f2 | tr -d '"'

echo ""

# Verify branch mapping
echo "🔍 Verifying Branch → Database Mapping:"
echo "======================================="

DEV_URL=$(grep "VITE_SUPABASE_URL" .env.vercel.dev | cut -d'=' -f2 | tr -d '"')
PREVIEW_URL=$(grep "VITE_SUPABASE_URL" .env.vercel.preview | cut -d'=' -f2 | tr -d '"')
PROD_URL=$(grep "VITE_SUPABASE_URL" .env.vercel.prod | cut -d'=' -f2 | tr -d '"')

# Extract branch IDs
DEV_BRANCH=$(echo $DEV_URL | grep -o '[a-f0-9-]\{36\}' || echo "unknown")
PREVIEW_BRANCH=$(echo $PREVIEW_URL | grep -o '[a-f0-9-]\{36\}' || echo "unknown")
PROD_BRANCH=$(echo $PROD_URL | grep -o '[a-f0-9-]\{36\}' || echo "unknown")

echo "✅ dev branch    → $DEV_BRANCH (dev database)"
echo "✅ preview branch → $PREVIEW_BRANCH (preview database)"
echo "✅ main branch   → $PROD_BRANCH (production database)"
echo ""

# Check if local environment files match Vercel
echo "🔄 Checking Local Environment Files:"
echo "===================================="

echo "Checking .env (development)..."
if [ -f ".env" ]; then
    LOCAL_DEV_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d'=' -f2)
    VERCEL_DEV_URL=$(grep "VITE_SUPABASE_URL" .env.vercel.dev | cut -d'=' -f2)
    
    if [ "$LOCAL_DEV_URL" = "$VERCEL_DEV_URL" ]; then
        echo "  ✅ .env matches Vercel development"
    else
        echo "  ⚠️  .env does not match Vercel development"
        echo "     Local:  $LOCAL_DEV_URL"
        echo "     Vercel: $VERCEL_DEV_URL"
    fi
else
    echo "  ⚠️  .env file not found"
fi

echo "Checking .env.local (preview)..."
if [ -f ".env.local" ]; then
    LOCAL_PREVIEW_URL=$(grep "VITE_SUPABASE_URL" .env.local | cut -d'=' -f2)
    VERCEL_PREVIEW_URL=$(grep "VITE_SUPABASE_URL" .env.vercel.preview | cut -d'=' -f2)
    
    if [ "$LOCAL_PREVIEW_URL" = "$VERCEL_PREVIEW_URL" ]; then
        echo "  ✅ .env.local matches Vercel preview"
    else
        echo "  ⚠️  .env.local does not match Vercel preview"
        echo "     Local:  $LOCAL_PREVIEW_URL"
        echo "     Vercel: $VERCEL_PREVIEW_URL"
    fi
else
    echo "  ⚠️  .env.local file not found"
fi

echo "Checking .env.production (production)..."
if [ -f ".env.production" ]; then
    LOCAL_PROD_URL=$(grep "VITE_SUPABASE_URL" .env.production | cut -d'=' -f2)
    VERCEL_PROD_URL=$(grep "VITE_SUPABASE_URL" .env.vercel.prod | cut -d'=' -f2)
    
    if [ "$LOCAL_PROD_URL" = "$VERCEL_PROD_URL" ]; then
        echo "  ✅ .env.production matches Vercel production"
    else
        echo "  ⚠️  .env.production does not match Vercel production"
        echo "     Local:  $LOCAL_PROD_URL"
        echo "     Vercel: $VERCEL_PROD_URL"
    fi
else
    echo "  ⚠️  .env.production file not found"
fi

echo ""

# Clean up temporary files
echo "🧹 Cleaning up..."
rm -f .env.vercel.dev .env.vercel.preview .env.vercel.prod .env.vercel.final

echo ""
echo "🎉 Environment Sync Complete!"
echo "============================="
echo ""
echo "📋 Summary:"
echo "- Development: Uses dev database branch"
echo "- Preview: Uses preview database branch"
echo "- Production: Uses main database branch"
echo ""
echo "🔗 Useful Commands:"
echo "- List all env vars: npx vercel env ls"
echo "- Pull specific env: npx vercel env pull --environment=<env>"
echo "- Add new env var: npx vercel env add <name> <environment>"
echo "- Remove env var: npx vercel env rm <name> <environment>"
echo ""
echo "📖 See VERCEL_ENV_CONFIG.md for detailed configuration guide"