#!/bin/bash

echo "🚀 Setting up LogYourBody iOS app for local testing..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the current IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n 1 | awk '{print $2}')

echo -e "${YELLOW}Your Mac's IP address is: ${IP}${NC}"
echo ""

echo "📋 Setup Instructions:"
echo ""
echo "1. First, set up the backend:"
echo "   cd .."
echo "   cp .env.example .env.local"
echo "   # Edit .env.local with your Supabase credentials"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "2. Update iOS app configuration:"
echo "   - For simulator: Use http://localhost:3000"
echo "   - For physical device: Use http://${IP}:3000"
echo ""
echo "3. Run the iOS app:"
echo "   - Open LogYourBody.xcodeproj in Xcode"
echo "   - Select your target device"
echo "   - Press Cmd+R to build and run"
echo ""
echo -e "${GREEN}✅ Make sure both your Mac and iPhone are on the same WiFi network!${NC}"
echo ""
echo "🔐 To test Supabase auth:"
echo "   1. Create a test user in your Supabase dashboard"
echo "   2. Try logging in with those credentials"
echo "   3. Check Xcode console for debug messages"