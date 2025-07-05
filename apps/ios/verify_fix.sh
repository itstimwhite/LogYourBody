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
