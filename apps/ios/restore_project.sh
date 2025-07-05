#!/bin/bash

echo "🔄 Restoring LogYourBody Xcode Project"
echo "======================================"
echo ""

cd "$(dirname "$0")"

# Find the most recent backup
echo "🔍 Looking for backups..."
LATEST_BACKUP=$(ls -dt *backup* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    echo ""
    echo "Try looking for:"
    ls -la | grep -i backup
    exit 1
fi

echo "📦 Found backup: $LATEST_BACKUP"

# Find the xcodeproj
XCODEPROJ=$(ls -d *.xcodeproj 2>/dev/null | head -1)

if [ -z "$XCODEPROJ" ]; then
    # Try to find it in the backup
    XCODEPROJ=$(ls -d $LATEST_BACKUP/*.xcodeproj 2>/dev/null | head -1 | xargs basename)
fi

if [ -z "$XCODEPROJ" ]; then
    echo "❌ Cannot determine project name"
    exit 1
fi

echo "📱 Project to restore: $XCODEPROJ"

# Restore the project
echo ""
echo "🔄 Restoring project file..."

if [ -d "$XCODEPROJ" ]; then
    rm -rf "$XCODEPROJ"
fi

cp -R "$LATEST_BACKUP/$XCODEPROJ" .

echo "✅ Project restored!"
echo ""
echo "Next steps:"
echo "1. Open $XCODEPROJ in Xcode"
echo "2. Clean Build Folder (Cmd + Shift + K)"
echo "3. Build (Cmd + B)"