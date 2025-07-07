#!/bin/bash

# Deploy Supabase migrations and edge functions
# This script should be run from the repository root

set -e

echo "🚀 Deploying Supabase migrations and functions..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: supabase/config.toml not found."
    echo "Make sure you're running this from the repository root."
    exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found. Please install it first:"
    echo "brew install supabase/tap/supabase"
    exit 1
fi

# Check if project is linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "⚠️  Project not linked. Please run:"
    echo "cd supabase && supabase link --project-ref <your-project-ref>"
    exit 1
fi

# Deploy database migrations
echo "📦 Deploying database migrations..."
cd supabase
supabase db push

# Deploy edge functions
echo "🔧 Deploying edge functions..."
# Copy iOS edge functions to main supabase functions directory
if [ -d "../apps/ios/supabase/functions" ]; then
    echo "📋 Copying iOS edge functions..."
    cp -r ../apps/ios/supabase/functions/* functions/ 2>/dev/null || true
fi

# Deploy all functions
for function in functions/*/; do
    if [ -d "$function" ]; then
        function_name=$(basename "$function")
        echo "  → Deploying function: $function_name"
        supabase functions deploy "$function_name"
    fi
done

echo ""
echo "✅ Deployment complete!"

# Show current storage buckets
echo ""
echo "📊 Current storage buckets:"
supabase storage buckets list 2>/dev/null || echo "Could not list buckets"

echo ""
echo "🎉 All done! Your Supabase project is up to date."