#!/bin/bash

# This script removes transparency from app icons for App Store compliance
# The App Store requires app icons to be in RGB format without alpha channel

echo "Fixing app icon transparency..."

# Navigate to the app icon directory
ICON_DIR="LogYourBody/Assets.xcassets/AppIcon.appiconset"
cd "$ICON_DIR" || exit 1

# Convert all PNG files to remove alpha channel
for icon in *.png; do
    if [ -f "$icon" ]; then
        echo "Processing $icon..."
        # Convert RGBA to RGB by flattening against white background
        sips -s format png --setProperty formatOptions 100 "$icon" --out temp.png
        # Remove alpha channel
        sips -s format jpeg "$icon" --out temp.jpg
        sips -s format png temp.jpg --out "$icon"
        rm -f temp.png temp.jpg
    fi
done

# Special handling for the 1024x1024 App Store icon
echo "Ensuring Icon-1024.png has no alpha channel..."
if [ -f "Icon-1024.png" ]; then
    # Create a white background
    sips -z 1024 1024 -s format png Icon-1024.png --out temp_icon.png
    # Composite onto white background to remove transparency
    sips -s format jpeg temp_icon.png --out temp_icon.jpg
    sips -s format png temp_icon.jpg --out Icon-1024.png
    rm -f temp_icon.png temp_icon.jpg
fi

echo "App icon transparency fix completed!"
echo ""
echo "Next steps:"
echo "1. Clean and rebuild the project in Xcode"
echo "2. Archive the app again"
echo "3. The app icons should now be compliant with App Store requirements"