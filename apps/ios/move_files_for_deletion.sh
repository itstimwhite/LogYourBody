#!/bin/bash

echo "📦 Moving files to deletion folder..."

# Navigate to the iOS project directory
cd "$(dirname "$0")"

# Create the deletion folder
echo "📁 Creating TO_BE_DELETED_FILES folder..."
mkdir -p TO_BE_DELETED_FILES

# Move empty/unused files
echo ""
echo "🚚 Moving files..."

# Move empty Swift files
if [ -f "LogYourBody/Services/SupabaseClient.swift" ]; then
    echo "  Moving SupabaseClient.swift..."
    mv LogYourBody/Services/SupabaseClient.swift TO_BE_DELETED_FILES/
fi

if [ -f "LogYourBody/Services/SupabaseManager.swift" ]; then
    echo "  Moving SupabaseManager.swift..."
    mv LogYourBody/Services/SupabaseManager.swift TO_BE_DELETED_FILES/
fi

# Move Package.swift files
if [ -f "Package.swift" ]; then
    echo "  Moving Package.swift..."
    mv Package.swift TO_BE_DELETED_FILES/
fi

if [ -f "Package.resolved" ]; then
    echo "  Moving Package.resolved..."
    mv Package.resolved TO_BE_DELETED_FILES/
fi

# Move any .swiftpm directories
if [ -d ".swiftpm" ]; then
    echo "  Moving .swiftpm directory..."
    mv .swiftpm TO_BE_DELETED_FILES/
fi

# Move any other empty files in ios-swift directory
if [ -d "ios-swift/.swiftpm" ]; then
    echo "  Moving ios-swift/.swiftpm directory..."
    mkdir -p TO_BE_DELETED_FILES/ios-swift
    mv ios-swift/.swiftpm TO_BE_DELETED_FILES/ios-swift/
fi

if [ -f "ios-swift/Package.resolved" ]; then
    echo "  Moving ios-swift/Package.resolved..."
    mkdir -p TO_BE_DELETED_FILES/ios-swift
    mv ios-swift/Package.resolved TO_BE_DELETED_FILES/ios-swift/
fi

echo ""
echo "✅ Files moved to TO_BE_DELETED_FILES folder"
echo ""
echo "📋 Contents of deletion folder:"
ls -la TO_BE_DELETED_FILES/

echo ""
echo "⚠️  IMPORTANT: Next steps:"
echo "1. Open Xcode"
echo "2. Remove the red (missing) file references from the project navigator"
echo "3. Clean build folder (Cmd + Shift + K)"
echo "4. Build the project (Cmd + B)"
echo "5. Once everything works, you can delete the TO_BE_DELETED_FILES folder"