#!/bin/bash

# Script to seed the database with test users
# Make sure you have the Supabase CLI installed and are logged in

echo "🌱 Seeding database with test users..."
echo ""
echo "⚠️  WARNING: This will delete existing test users (emails ending with @example.com)"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Use Supabase connection string
SUPABASE_PROJECT_ID="ihivupqpctpkrgqgxfjf"
SUPABASE_PASSWORD="zzbTSr5i2y9QBXPu"
DATABASE_URL="postgresql://postgres:${SUPABASE_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"

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