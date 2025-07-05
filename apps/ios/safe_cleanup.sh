#!/bin/bash

echo "🧹 Safe Cleanup for LogYourBody iOS Project"
echo "==========================================="
echo "This script identifies issues without moving files"
echo ""

cd "$(dirname "$0")"

# Step 1: Identify duplicate files
echo "🔍 Step 1: Checking for duplicate files..."
echo ""

# Check for duplicate Config.xcconfig
if [ -f "LogYourBody/Config.xcconfig" ] && [ -f "Config.xcconfig" ]; then
    echo "⚠️  Found duplicate Config.xcconfig files:"
    echo "   - /Config.xcconfig (keep this one)"
    echo "   - /LogYourBody/Config.xcconfig (remove reference in Xcode)"
fi

# Check for empty files
echo ""
echo "📄 Empty files found:"
for file in "LogYourBody/Services/SupabaseClient.swift" "LogYourBody/Services/SupabaseManager.swift" "Package.swift"; do
    if [ -f "$file" ] && [ ! -s "$file" ]; then
        echo "   - $file (remove from Xcode)"
    fi
done

# Step 2: Show current structure
echo ""
echo "📁 Current Services structure:"
ls -la LogYourBody/Services/

# Step 3: Clean build artifacts
echo ""
echo "🗑️  Step 3: Cleaning build artifacts..."
rm -rf build/
rm -rf DerivedData/
echo "✅ Build artifacts cleaned"

# Step 4: Clean Derived Data
echo ""
echo "🗄️  Step 4: Cleaning Xcode Derived Data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LogYourBody-*
echo "✅ Derived Data cleaned"

# Step 5: Generate Xcode cleanup instructions
echo ""
echo "📋 Creating Xcode cleanup instructions..."

cat > "XCODE_CLEANUP_GUIDE.md" << 'EOL'
# Xcode Cleanup Guide

## 🔧 Manual Cleanup Steps in Xcode

### 1. Remove Duplicate Config.xcconfig
- In Project Navigator, find `Config.xcconfig`
- If it appears twice, remove the one inside LogYourBody folder
- Keep the one at the root level

### 2. Remove Empty Files
Remove references to these empty files:
- SupabaseClient.swift (if it shows as 0 bytes)
- SupabaseManager.swift (if it shows as 0 bytes)
- Package.swift

### 3. Fix "Multiple Commands Produce" Error
1. Select your project in the navigator
2. Select the LogYourBody target
3. Go to Build Phases → Copy Bundle Resources
4. Look for duplicate entries (files listed twice)
5. Remove duplicates by selecting and clicking the minus button

### 4. Check Target Membership
For each Swift file:
1. Select the file
2. Open File Inspector (right panel)
3. Under "Target Membership", ensure only "LogYourBody" is checked

### 5. Clean File References
1. Look for red files (missing references)
2. Right-click → Delete → Remove Reference
3. If needed, re-add the file from its actual location

### 6. Final Build
1. Clean: `Cmd + Shift + K`
2. Build: `Cmd + B`

## ✅ Your Clean Project Structure

```
LogYourBody/
├── Services/
│   ├── AuthManager.swift         ✓ Clerk authentication
│   ├── ClerkClient.swift         ✓ Clerk API client
│   ├── CoreDataManager.swift     ✓ Local storage
│   ├── HealthKitManager.swift    ✓ Health data
│   ├── LoadingManager.swift      ✓ App loading
│   ├── SupabaseDataClient.swift  ✓ Cloud storage
│   └── SyncManager.swift         ✓ Data sync
├── Views/
│   ├── LoginView.swift
│   ├── SignUpView.swift
│   ├── EmailVerificationView.swift
│   └── [other views]
├── Models/
│   └── [data models]
└── Utils/
    └── Constants.swift
```
EOL

echo ""
echo "✅ Safe cleanup complete!"
echo ""
echo "📋 What to do next:"
echo "1. Open XCODE_CLEANUP_GUIDE.md"
echo "2. Follow the manual cleanup steps in Xcode"
echo "3. This script has already cleaned build artifacts"
echo ""
echo "No files were moved - all cleanup must be done in Xcode"