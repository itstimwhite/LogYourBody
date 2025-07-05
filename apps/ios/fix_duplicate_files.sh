#!/bin/bash

echo "🔍 Finding and fixing duplicate files in Xcode project..."

# Navigate to the iOS project directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"

# Find the .xcodeproj file
PROJ_FILE=$(find . -name "*.xcodeproj" -type d | head -1)
if [ -z "$PROJ_FILE" ]; then
    echo "❌ No .xcodeproj file found"
    exit 1
fi

echo "📱 Found project: $PROJ_FILE"

# Look for duplicate file references in the project
echo ""
echo "🔍 Checking for duplicate files..."

# Common duplicate files to check
echo ""
echo "📋 Files that might be duplicated:"
echo "  - Files in both ios-native and ios-swift folders"
echo "  - Multiple references to the same Swift files"
echo "  - Info.plist files"

echo ""
echo "🛠️  To fix this issue in Xcode:"
echo ""
echo "1. Open your project in Xcode"
echo ""
echo "2. In the Project Navigator (left sidebar):"
echo "   - Look for files that appear multiple times"
echo "   - Common duplicates: Swift files, Info.plist, Assets"
echo ""
echo "3. For each duplicate file:"
echo "   - Right-click on one of the duplicates"
echo "   - Choose 'Show in Finder' to see which one is the correct file"
echo "   - Delete the duplicate reference (not the file itself)"
echo "   - Choose 'Remove Reference' when prompted"
echo ""
echo "4. Check your target membership:"
echo "   - Select each file"
echo "   - In the File Inspector (right panel)"
echo "   - Make sure 'Target Membership' is checked for only ONE target"
echo ""
echo "5. Clean and rebuild:"
echo "   - Product → Clean Build Folder (Cmd+Shift+K)"
echo "   - Product → Build (Cmd+B)"
echo ""
echo "💡 Common files that cause this issue:"
echo "   - Info.plist (should only have one per target)"
echo "   - LaunchScreen.storyboard"
echo "   - Assets.xcassets"
echo "   - Any Swift files that were copied/moved"

# List potential duplicate files
echo ""
echo "🔍 Potential duplicate Swift files:"
find . -name "*.swift" -type f | sort | uniq -d

echo ""
echo "📝 If you see specific error messages about conflicting outputs,"
echo "   they usually mention the exact files causing the problem."
echo "   Share those specific error messages for more targeted help."