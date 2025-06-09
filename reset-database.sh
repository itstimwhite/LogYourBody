#!/bin/bash

echo "🔄 Resetting Supabase database for fresh testing..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo "💡 You can start Docker Desktop from Applications or run: open -a Docker"
    exit 1
fi

echo "✅ Docker is running"

# Stop Supabase if running
echo "🛑 Stopping Supabase..."
npm run supabase:stop

# Start Supabase fresh
echo "🚀 Starting Supabase..."
npm run supabase:start

# Reset the database with migrations
echo "🗄️ Resetting database with fresh migrations..."
npm run supabase:reset

echo "✅ Database reset complete!"
echo ""
echo "🎯 Your Supabase is now ready for fresh testing:"
echo "   • All user data has been cleared"
echo "   • Schema is up to date"
echo "   • Ready for new user registrations"
echo ""
echo "🌐 Access Supabase Studio at: http://localhost:54323"
echo "📱 Your app will connect to the local instance"