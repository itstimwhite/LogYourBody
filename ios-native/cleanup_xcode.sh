#!/bin/bash

echo "🧹 Cleaning up Xcode project..."

# Navigate to the iOS project directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"

# 1. Remove empty/unused files
echo ""
echo "🗑️  Removing empty/unused files..."
rm -f LogYourBody/Services/SupabaseClient.swift
rm -f LogYourBody/Services/SupabaseManager.swift
rm -f Package.swift
rm -f Package.resolved
echo "✅ Empty files removed"

# 2. Clean build artifacts
echo ""
echo "🧹 Cleaning build artifacts..."
rm -rf build/
rm -rf DerivedData/
rm -rf .build/
rm -rf .swiftpm/
echo "✅ Build artifacts cleaned"

# 3. Clean Xcode derived data
echo ""
echo "🗄️  Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LogYourBody-*
echo "✅ Derived data cleaned"

# 4. List remaining service files
echo ""
echo "📋 Remaining service files:"
ls -la LogYourBody/Services/

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Open Xcode"
echo "2. Remove the red (missing) file references:"
echo "   - SupabaseClient.swift"
echo "   - SupabaseManager.swift"
echo "   - Package.swift"
echo "3. Clean build folder (Cmd + Shift + K)"
echo "4. Build the project (Cmd + B)"