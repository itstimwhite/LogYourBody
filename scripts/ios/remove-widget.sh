#!/bin/bash

echo "Removing iOS Widget Extension"
echo "============================="

cd apps/ios

# Remove widget directory
echo "1. Removing widget source files..."
rm -rf LogYourBodyWidget

# Clean build directories
echo "2. Cleaning build artifacts..."
rm -rf build/Build/Products/*/LogYourBodyWidgetExtension.*
rm -rf build/Build/Intermediates.noindex/*/LogYourBodyWidgetExtension.build
rm -rf DerivedData/Build/Products/*/LogYourBodyWidgetExtension.*
rm -rf DerivedData/Build/Intermediates.noindex/*/LogYourBodyWidgetExtension.build

echo ""
echo "IMPORTANT: Manual steps required in Xcode:"
echo "========================================="
echo "1. Open LogYourBody.xcodeproj in Xcode"
echo "2. Select LogYourBodyWidgetExtension target"
echo "3. Press Delete to remove the target"
echo "4. Remove LogYourBodyWidget folder reference"
echo "5. Remove WidgetKit.framework from Frameworks"
echo "6. Remove Widget extension from 'Embed Foundation Extensions' build phase"
echo "7. Update Info.plist to remove widget configuration if present"
echo ""
echo "After Xcode changes, commit with:"
echo "git add -A && git commit -m 'chore: remove iOS widget extension'"
echo ""
echo "This will simplify TestFlight deployment by removing the need for"
echo "a separate provisioning profile for the widget extension."