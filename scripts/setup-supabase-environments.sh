#!/bin/bash

# Supabase Multi-Environment Setup Script
# This script helps set up separate Supabase databases for dev, preview, and production

set -e

echo "🚀 Supabase Multi-Environment Setup"
echo "======================================"
echo ""
echo "This script will help you set up separate Supabase databases for:"
echo "  - Development (dev branch)"
echo "  - Preview (preview branch)" 
echo "  - Production (main branch - current database)"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Login to Supabase (if not already logged in)
echo "🔐 Logging into Supabase..."
if ! supabase projects list &> /dev/null; then
    echo "Please log in to Supabase:"
    supabase login
else
    echo "✅ Already logged in to Supabase"
fi
echo ""

# Show current projects
echo "📋 Your current Supabase projects:"
supabase projects list
echo ""

# Get project refs for new environments
echo "🏗️  Setting up new environments..."
echo ""

# Development Database Setup
echo "=== Development Database ==="
read -p "Enter the project ref for your DEVELOPMENT database: " DEV_REF
read -s -p "Enter the database password for development: " DEV_PASSWORD
echo ""

if [ ! -z "$DEV_REF" ] && [ ! -z "$DEV_PASSWORD" ]; then
    echo "🔄 Linking to development database..."
    supabase link --project-ref $DEV_REF
    
    echo "🔄 Pushing migrations to development database..."
    supabase db push --password $DEV_PASSWORD
    
    echo "✅ Development database setup complete"
    
    # Get the development keys
    echo "🔑 Fetching development API keys..."
    DEV_ANON_KEY=$(supabase projects api-keys --project-ref $DEV_REF | grep "anon" | awk '{print $2}')
    DEV_SERVICE_KEY=$(supabase projects api-keys --project-ref $DEV_REF | grep "service_role" | awk '{print $2}')
    
    echo "Development URL: https://$DEV_REF.supabase.co"
    echo "Development Anon Key: $DEV_ANON_KEY"
else
    echo "⚠️  Skipping development database setup"
fi

echo ""

# Preview Database Setup  
echo "=== Preview Database ==="
read -p "Enter the project ref for your PREVIEW database: " PREVIEW_REF
read -s -p "Enter the database password for preview: " PREVIEW_PASSWORD
echo ""

if [ ! -z "$PREVIEW_REF" ] && [ ! -z "$PREVIEW_PASSWORD" ]; then
    echo "🔄 Linking to preview database..."
    supabase link --project-ref $PREVIEW_REF
    
    echo "🔄 Pushing migrations to preview database..."
    supabase db push --password $PREVIEW_PASSWORD
    
    echo "✅ Preview database setup complete"
    
    # Get the preview keys
    echo "🔑 Fetching preview API keys..."
    PREVIEW_ANON_KEY=$(supabase projects api-keys --project-ref $PREVIEW_REF | grep "anon" | awk '{print $2}')
    PREVIEW_SERVICE_KEY=$(supabase projects api-keys --project-ref $PREVIEW_REF | grep "service_role" | awk '{print $2}')
    
    echo "Preview URL: https://$PREVIEW_REF.supabase.co"
    echo "Preview Anon Key: $PREVIEW_ANON_KEY"
else
    echo "⚠️  Skipping preview database setup"
fi

echo ""

# Production info (current database)
echo "=== Production Database (Current) ==="
echo "Production URL: https://przjeunffnkjzxpykvjn.supabase.co"
echo "Production Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByempldW5mZm5ranp4cHlrdmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTI1NDYsImV4cCI6MjA2NDk4ODU0Nn0.jZyohfzoydZKaSH_q0Tu4VqEbyFDdf-8i0kSm-YzB8w"
echo ""

# Generate updated environment files
echo "📝 Generating updated environment files..."

# Update .env (development)
if [ ! -z "$DEV_REF" ]; then
    echo "🔄 Updating .env for development..."
    
    # Backup current .env
    cp .env .env.backup
    
    # Update development URLs in .env
    sed -i.bak "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=https://$DEV_REF.supabase.co|g" .env
    sed -i.bak "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$DEV_ANON_KEY|g" .env
    sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=https://$DEV_REF.supabase.co|g" .env
    sed -i.bak "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$DEV_ANON_KEY|g" .env
    sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$DEV_SERVICE_KEY|g" .env
    
    # Clean up backup file
    rm .env.bak
    
    echo "✅ Updated .env for development environment"
fi

# Update .env.local (preview)  
if [ ! -z "$PREVIEW_REF" ]; then
    echo "🔄 Updating .env.local for preview..."
    
    # Backup current .env.local
    cp .env.local .env.local.backup
    
    # Update preview URLs in .env.local
    sed -i.bak "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=\"https://$PREVIEW_REF.supabase.co\"|g" .env.local
    sed -i.bak "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=\"$PREVIEW_ANON_KEY\"|g" .env.local
    sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=\"https://$PREVIEW_REF.supabase.co\"|g" .env.local
    sed -i.bak "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=\"$PREVIEW_ANON_KEY\"|g" .env.local
    sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=\"$PREVIEW_SERVICE_KEY\"|g" .env.local
    
    # Clean up backup file
    rm .env.local.bak
    
    echo "✅ Updated .env.local for preview environment"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "✅ Environment files updated"
echo "✅ Database migrations applied"
echo "✅ API keys configured"
echo ""
echo "📋 Next Steps:"
echo "1. Update Vercel environment variables:"
echo "   - Production: Use production database (current)"
echo "   - Preview: Use preview database"
echo "   - Development: Use development database"
echo ""
echo "2. Test each environment:"
echo "   - Push to dev branch and verify development deployment"
echo "   - Merge to preview and verify preview deployment"
echo "   - Merge to main and verify production deployment"
echo ""
echo "3. Backup files created:"
echo "   - .env.backup"
echo "   - .env.local.backup"
echo ""
echo "🔗 Useful Commands:"
echo "   - View projects: supabase projects list"
echo "   - Switch database: supabase link --project-ref [ref]"
echo "   - Push migrations: supabase db push"
echo "   - Reset database: supabase db reset"
echo ""
echo "📖 See SUPABASE_MULTI_ENV_SETUP.md for detailed documentation"