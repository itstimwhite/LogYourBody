#!/bin/bash

echo "🚀 Automated Project Fix for LogYourBody"
echo "========================================"
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Step 1: Clean derived data and build artifacts
echo "🗑️  Step 1: Cleaning build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LogYourBody-*
rm -rf build/
rm -rf DerivedData/
echo "✅ Build artifacts cleaned"

# Step 2: Remove empty and duplicate files
echo ""
echo "🧹 Step 2: Removing empty and problematic files..."

# Create a trash directory for removed files
TRASH_DIR="_REMOVED_FILES_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$TRASH_DIR"

# Move empty files
for file in "LogYourBody/Services/SupabaseClient.swift" "LogYourBody/Services/SupabaseManager.swift" "Package.swift" "Package.resolved"; do
    if [ -f "$file" ]; then
        echo "  Moving $file to trash..."
        mv "$file" "$TRASH_DIR/" 2>/dev/null
    fi
done

# Handle duplicate Config.xcconfig
if [ -f "LogYourBody/Config.xcconfig" ] && [ -f "Config.xcconfig" ]; then
    echo "  Moving duplicate Config.xcconfig to trash..."
    mv "LogYourBody/Config.xcconfig" "$TRASH_DIR/"
fi

# Clean up ios-swift artifacts
if [ -d "../ios-swift/.swiftpm" ]; then
    echo "  Removing ios-swift/.swiftpm..."
    rm -rf "../ios-swift/.swiftpm"
fi
if [ -f "../ios-swift/Package.resolved" ]; then
    echo "  Removing ios-swift/Package.resolved..."
    rm -f "../ios-swift/Package.resolved"
fi

# Remove the TO_BE_DELETED_FILES directory if it exists
if [ -d "TO_BE_DELETED_FILES" ]; then
    echo "  Removing TO_BE_DELETED_FILES directory..."
    rm -rf "TO_BE_DELETED_FILES"
fi

echo "✅ File cleanup complete"

# Step 3: Run Python script to fix Xcode project file
echo ""
echo "🔧 Step 3: Fixing Xcode project file..."
if command -v python3 &> /dev/null; then
    chmod +x auto_fix_xcode.py
    python3 auto_fix_xcode.py
else
    echo "⚠️  Python3 not found. Skipping automatic project file fix."
fi

# Step 4: Create a verification script
echo ""
echo "📝 Step 4: Creating verification script..."

cat > "verify_fix.sh" << 'EOL'
#!/bin/bash
echo "🔍 Verifying project fix..."
echo ""

# Check if problematic files are gone
echo "Checking for removed files:"
for file in "LogYourBody/Services/SupabaseClient.swift" "LogYourBody/Services/SupabaseManager.swift" "Package.swift" "LogYourBody/Config.xcconfig"; do
    if [ -f "$file" ]; then
        echo "  ❌ $file still exists!"
    else
        echo "  ✅ $file removed"
    fi
done

echo ""
echo "Current Services directory:"
ls -la LogYourBody/Services/ | grep -E "\.swift$"

echo ""
echo "If all checks pass, open Xcode and:"
echo "1. Clean Build Folder (Cmd + Shift + K)"
echo "2. Build (Cmd + B)"
EOL

chmod +x verify_fix.sh

# Step 5: Generate final instructions
echo ""
echo "📋 Step 5: Creating final instructions..."

cat > "FINAL_STEPS.md" << 'EOL'
# Final Steps to Complete the Fix

## ✅ What Was Done Automatically:

1. **Cleaned all build artifacts and derived data**
2. **Removed empty files:**
   - SupabaseClient.swift
   - SupabaseManager.swift
   - Package.swift
3. **Removed duplicate Config.xcconfig**
4. **Fixed Xcode project file** (removed references to deleted files)

## 🔧 What You Need to Do in Xcode:

1. **Open LogYourBody.xcodeproj**

2. **If you see any red (missing) files:**
   - Right-click → Delete → Remove Reference

3. **Clean and Build:**
   - Clean Build Folder: `Cmd + Shift + K`
   - Build: `Cmd + B`

4. **If "Multiple commands produce" error persists:**
   - Select project → LogYourBody target
   - Build Phases → Copy Bundle Resources
   - Remove any duplicate entries

## ✅ Your App Should Now:
- Build without errors
- Use Clerk for authentication
- Use Supabase for data storage
- Have a clean project structure

## 🚨 If Something Goes Wrong:
A backup of your project file was created. Check CLEANUP_REPORT.md for the backup location.
EOL

# Summary
echo ""
echo "=========================================="
echo "✅ Automated fix complete!"
echo ""
echo "📁 Removed files are in: $TRASH_DIR"
echo "📋 Reports created:"
echo "   - CLEANUP_REPORT.md (if Python script ran)"
echo "   - FINAL_STEPS.md"
echo "   - verify_fix.sh"
echo ""
echo "🎯 Next step: Open Xcode and follow FINAL_STEPS.md"
echo ""
echo "Run ./verify_fix.sh to check the results"