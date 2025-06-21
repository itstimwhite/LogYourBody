#!/bin/bash

# Script to seed the database with test users
# Make sure you have the Supabase CLI installed and are logged in

echo "🌱 Seeding database with test users..."
echo ""
echo "⚠️  WARNING: This will delete existing test users (emails ending with @example.com)"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Check if we have the required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found. Loading from .env.local..."
  export $(cat .env.local | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL still not found. Please set it in your environment or .env.local"
  exit 1
fi

# Run the seed script
echo "🔄 Running seed script..."
psql "$DATABASE_URL" -f supabase/seed-users.sql

if [ $? -eq 0 ]; then
  echo "✅ Database seeded successfully!"
  echo ""
  echo "📝 Test users created:"
  echo "   - sarah.chen@example.com (Weight loss journey - Female)"
  echo "   - marcus.johnson@example.com (Bulking - Male)"
  echo "   - emily.rodriguez@example.com (Maintenance - Female)"
  echo "   - david.kim@example.com (Weight loss journey - Male)"
  echo "   - jessica.thompson@example.com (Recomposition - Female)"
  echo ""
  echo "🔑 All users have password: password123"
  echo ""
  echo "🧪 To test the seeded data, run:"
  echo "   npm run test:seed"
else
  echo "❌ Error seeding database"
  exit 1
fi