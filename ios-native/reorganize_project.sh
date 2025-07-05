#!/bin/bash

echo "🔧 Reorganizing LogYourBody iOS Project..."
echo "========================================="

# Navigate to the iOS project directory
cd "$(dirname "$0")"
BASE_DIR=$(pwd)

echo "📁 Working in: $BASE_DIR"

# Create backup directory
echo ""
echo "📦 Creating backup directory..."
mkdir -p _PROJECT_BACKUP_$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="_PROJECT_BACKUP_$(date +%Y%m%d_%H%M%S)"

# Step 1: Clean up duplicate and empty files
echo ""
echo "🧹 Step 1: Cleaning up duplicate and empty files..."

# Move empty files to backup
mkdir -p "$BACKUP_DIR/empty_files"
[ -f "LogYourBody/Services/SupabaseClient.swift" ] && mv "LogYourBody/Services/SupabaseClient.swift" "$BACKUP_DIR/empty_files/"
[ -f "LogYourBody/Services/SupabaseManager.swift" ] && mv "LogYourBody/Services/SupabaseManager.swift" "$BACKUP_DIR/empty_files/"
[ -f "Package.swift" ] && mv "Package.swift" "$BACKUP_DIR/empty_files/"
[ -f "Package.resolved" ] && mv "Package.resolved" "$BACKUP_DIR/empty_files/"

# Remove duplicate Config.xcconfig
if [ -f "LogYourBody/Config.xcconfig" ] && [ -f "Config.xcconfig" ]; then
    echo "  Found duplicate Config.xcconfig - keeping root version"
    mv "LogYourBody/Config.xcconfig" "$BACKUP_DIR/"
fi

# Step 2: Organize Services
echo ""
echo "📂 Step 2: Organizing Services folder..."
mkdir -p "LogYourBody/Services/Authentication"
mkdir -p "LogYourBody/Services/DataStorage"
mkdir -p "LogYourBody/Services/HealthKit"
mkdir -p "LogYourBody/Services/Utilities"

# Move files to organized folders (only if they exist)
[ -f "LogYourBody/Services/AuthManager.swift" ] && mv "LogYourBody/Services/AuthManager.swift" "LogYourBody/Services/Authentication/"
[ -f "LogYourBody/Services/ClerkClient.swift" ] && mv "LogYourBody/Services/ClerkClient.swift" "LogYourBody/Services/Authentication/"

[ -f "LogYourBody/Services/CoreDataManager.swift" ] && mv "LogYourBody/Services/CoreDataManager.swift" "LogYourBody/Services/DataStorage/"
[ -f "LogYourBody/Services/SupabaseDataClient.swift" ] && mv "LogYourBody/Services/SupabaseDataClient.swift" "LogYourBody/Services/DataStorage/"
[ -f "LogYourBody/Services/SyncManager.swift" ] && mv "LogYourBody/Services/SyncManager.swift" "LogYourBody/Services/DataStorage/"

[ -f "LogYourBody/Services/HealthKitManager.swift" ] && mv "LogYourBody/Services/HealthKitManager.swift" "LogYourBody/Services/HealthKit/"

[ -f "LogYourBody/Services/LoadingManager.swift" ] && mv "LogYourBody/Services/LoadingManager.swift" "LogYourBody/Services/Utilities/"

# Step 3: Clean up build artifacts
echo ""
echo "🗑️  Step 3: Cleaning up build artifacts..."
rm -rf build/
rm -rf DerivedData/
rm -rf "$BASE_DIR/TO_BE_DELETED_FILES"

# Step 4: Clean up ios-swift artifacts if they exist
if [ -d "../ios-swift" ]; then
    echo ""
    echo "🧹 Step 4: Cleaning up ios-swift artifacts..."
    rm -rf "../ios-swift/.swiftpm"
    rm -f "../ios-swift/Package.resolved"
fi

# Step 5: Create project structure documentation
echo ""
echo "📝 Step 5: Creating project structure documentation..."

cat > "PROJECT_STRUCTURE.md" << 'EOL'
# LogYourBody iOS Project Structure

## 📁 Project Organization

```
ios-native/
├── Config.xcconfig                 # Build configuration
├── LogYourBody/
│   ├── LogYourBodyApp.swift       # App entry point
│   ├── ContentView.swift          # Main content view
│   ├── Info.plist                 # App configuration
│   ├── Assets.xcassets/           # Images and colors
│   ├── LogYourBody.entitlements   # App capabilities
│   │
│   ├── Models/                    # Data models
│   │   ├── User.swift
│   │   ├── BodyMetrics.swift
│   │   ├── DailyMetrics.swift
│   │   └── ...
│   │
│   ├── Views/                     # UI Views
│   │   ├── Authentication/
│   │   │   ├── LoginView.swift
│   │   │   ├── SignUpView.swift
│   │   │   └── EmailVerificationView.swift
│   │   ├── Dashboard/
│   │   │   └── DashboardView.swift
│   │   ├── Settings/
│   │   │   └── PreferencesView.swift
│   │   └── ...
│   │
│   ├── Services/                  # Business logic
│   │   ├── Authentication/
│   │   │   ├── AuthManager.swift
│   │   │   └── ClerkClient.swift
│   │   ├── DataStorage/
│   │   │   ├── CoreDataManager.swift
│   │   │   ├── SupabaseDataClient.swift
│   │   │   └── SyncManager.swift
│   │   ├── HealthKit/
│   │   │   └── HealthKitManager.swift
│   │   └── Utilities/
│   │       └── LoadingManager.swift
│   │
│   ├── Utils/                     # Utilities
│   │   ├── Constants.swift
│   │   └── Extensions.swift
│   │
│   └── CoreData/                  # Core Data models
│       └── LogYourBody.xcdatamodeld
│
└── LogYourBody.xcodeproj/         # Xcode project
```

## 🔑 Key Components

### Authentication
- **Clerk** for user authentication
- **AuthManager** handles auth state
- **ClerkClient** manages Clerk API calls

### Data Storage
- **Supabase** for cloud data storage
- **Core Data** for local/offline storage
- **SyncManager** handles data synchronization

### Health Integration
- **HealthKit** for fitness data
- Syncs weight and step data

## 🚀 Getting Started

1. Open `LogYourBody.xcodeproj` in Xcode
2. Clean build folder: `Cmd + Shift + K`
3. Build: `Cmd + B`
4. Run: `Cmd + R`
EOL

# Step 6: Generate Xcode fix instructions
echo ""
echo "📋 Step 6: Creating Xcode fix instructions..."

cat > "XCODE_FIX_INSTRUCTIONS.md" << 'EOL'
# Xcode Project Fix Instructions

## ⚠️ IMPORTANT: Manual Steps Required in Xcode

After running the reorganization script, you need to update file references in Xcode:

### 1. Open Xcode
Open `LogYourBody.xcodeproj`

### 2. Remove Missing References (Red Files)
- Look for any red files in the Project Navigator
- Right-click → Delete → Remove Reference
- These are files that were moved or deleted

### 3. Re-add Reorganized Files
Since we moved files to subfolders, you need to update their references:

1. Right-click on `Services` folder
2. Select "Add Files to LogYourBody..."
3. Navigate to `LogYourBody/Services`
4. Select all the subfolders (Authentication, DataStorage, etc.)
5. Make sure:
   - ✅ "Copy items if needed" is UNCHECKED
   - ✅ "Create groups" is selected
   - ✅ "LogYourBody" target is checked
6. Click "Add"

### 4. Remove Duplicate References
If you see any files appearing twice:
- Right-click the duplicate
- Delete → Remove Reference

### 5. Clean and Build
1. Clean Build Folder: `Cmd + Shift + K`
2. Delete Derived Data: `rm -rf ~/Library/Developer/Xcode/DerivedData/LogYourBody-*`
3. Build: `Cmd + B`

### 6. Common Issues and Fixes

**"Multiple commands produce" error:**
- Look for duplicate files in the project
- Check that each file is only in one target

**"No such module" error:**
- Make sure all Swift files are added to the target
- Check Target Membership in File Inspector

**Red files in navigator:**
- These are moved files
- Remove reference and re-add from new location
EOL

# Step 7: Create a file list for reference
echo ""
echo "📋 Creating file inventory..."
find LogYourBody -name "*.swift" -type f | sort > "swift_files_inventory.txt"

# Summary
echo ""
echo "✅ Reorganization Complete!"
echo "=========================="
echo ""
echo "📁 Backup created in: $BACKUP_DIR"
echo "📝 Documentation created:"
echo "   - PROJECT_STRUCTURE.md"
echo "   - XCODE_FIX_INSTRUCTIONS.md"
echo "   - swift_files_inventory.txt"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Open Xcode"
echo "2. Follow the instructions in XCODE_FIX_INSTRUCTIONS.md"
echo "3. Update file references for the reorganized structure"
echo "4. Clean and build the project"
echo ""
echo "The script has reorganized your files but Xcode needs manual updates!"