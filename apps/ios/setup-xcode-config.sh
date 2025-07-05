#!/bin/bash

echo "🔧 Setting up Xcode configuration..."

# Check if Config.xcconfig exists
if [ ! -f "LogYourBody/Config.xcconfig" ]; then
    echo "❌ Config.xcconfig not found!"
    echo ""
    echo "Creating Config.xcconfig from example..."
    cp LogYourBody/Config.xcconfig.example LogYourBody/Config.xcconfig
    echo ""
    echo "⚠️  Please edit LogYourBody/Config.xcconfig with your Supabase credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo ""
    echo "You can find these in your Supabase project settings."
else
    echo "✅ Config.xcconfig found!"
fi

echo ""
echo "📝 Next steps:"
echo "1. Open LogYourBody.xcodeproj in Xcode"
echo "2. Select the project in the navigator"
echo "3. Select the LogYourBody target"
echo "4. Go to the 'Info' tab"
echo "5. Under 'Configurations', set both Debug and Release to use 'Config'"
echo ""
echo "Or use this command to set it programmatically:"
echo "cd LogYourBody.xcodeproj && plutil -replace 'buildConfigurationList' -xml '<dict><key>defaultConfigurationName</key><string>Release</string></dict>' project.pbxproj"