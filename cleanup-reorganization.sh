#!/bin/bash

echo "🧹 Cleaning up reorganization..."

# Remove temporary MD files from React troubleshooting
rm -f AUTH_FIX_INSTRUCTIONS.md
rm -f AUTH_FIX_SUMMARY.md  
rm -f AVATAR_SYSTEM.md
rm -f IMPLEMENTATION_SUMMARY.md
rm -f NEXTJS_MIGRATION_PLAN.md
rm -f NEXTJS_ROUTE_CONVERSION.md
rm -f NEXTJS_TECHNICAL_GUIDE.md
rm -f VERCEL_ENV_CONFIG.md
rm -f VERCEL_ENV_SETUP.md
rm -f SUPABASE_MULTI_ENV_SETUP.md

# Remove temporary SQL files
rm -f REMOVE_EMAIL_SUBSCRIPTION_TRIGGER.sql
rm -f RESTORE_AUTH_SYSTEM.sql
rm -f seed_test_users.sql

# Remove temporary Vercel configs
rm -f vercel-local.json
rm -f vercel-preview.json

# Remove build artifacts
rm -rf dist/
rm -f tsconfig.tsbuildinfo

# Remove empty next-app folder if it exists
rm -rf next-app/

echo "✅ Cleanup complete!"
echo ""
echo "📁 Current structure:"
echo "├── src/                 (Next.js 15 App Router)"
echo "├── public/              (Static assets)"
echo "├── legacy-react/        (Original React app)"
echo "├── ios/                 (Capacitor iOS)"
echo "├── supabase/            (Database migrations)"
echo "├── scripts/             (Build scripts)"
echo "├── package.json         (Next.js dependencies)"
echo "├── vercel.json          (Deployment config)"
echo "└── .env.local           (Environment variables)"