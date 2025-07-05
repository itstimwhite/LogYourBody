#!/bin/bash

# LogYourBody - OpenAI Codex Setup Script
# This script sets up the development environment for the LogYourBody project

echo "🚀 Setting up LogYourBody development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOL'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# RevenueCat Configuration (Optional)
NEXT_PUBLIC_REVENUECAT_API_KEY_APPLE=your_apple_api_key
NEXT_PUBLIC_REVENUECAT_API_KEY_GOOGLE=your_google_api_key
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret

# Twilio Configuration (Optional - for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid

# OpenAI Configuration (for PDF parsing)
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Vercel Configuration (for deployment)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
EOL
    echo "⚠️  Please update .env.local with your actual API keys"
fi

# Set up Supabase local development (optional)
if command -v supabase &> /dev/null; then
    echo "🗄️  Supabase CLI detected. Initializing local development..."
    supabase init --workdir supabase || true
else
    echo "ℹ️  Supabase CLI not found. Install it for local development:"
    echo "   brew install supabase/tap/supabase"
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p public/avatars
mkdir -p public/avatars-new/male
mkdir -p public/avatars-new/female
mkdir -p src/types
mkdir -p scripts

# Set up Git hooks
if [ -f scripts/setup-git-hooks.sh ]; then
    echo "🪝 Setting up Git hooks..."
    bash scripts/setup-git-hooks.sh
fi

# Build the project
echo "🏗️  Building the project..."
npm run build

# Run type checking
echo "🔍 Running type check..."
npm run typecheck || echo "⚠️  Type errors found - please fix them"

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests || echo "⚠️  Some tests failed"

echo "
✨ Setup complete! 

To start the development server:
  npm run dev

To run tests:
  npm test

To build for production:
  npm run build

Important notes:
1. Update .env.local with your actual API keys
2. Set up Supabase database by running migrations:
   npx supabase db push --password your_db_password
3. For iOS development, run:
   npx cap sync ios
4. For PWA support is already configured

Happy coding! 🎉
"