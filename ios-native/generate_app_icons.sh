#!/bin/bash

# This script generates all required iOS app icon sizes from a 1024x1024 source image
# Usage: ./generate_app_icons.sh source_icon.png

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 source_icon.png"
    echo "Source icon should be 1024x1024 pixels"
    exit 1
fi

SOURCE=$1
OUTPUT_DIR="LogYourBody/Assets.xcassets/AppIcon.appiconset"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# iPhone Notification icons
sips -z 40 40 "$SOURCE" --out "$OUTPUT_DIR/Icon-20@2x.png"
sips -z 60 60 "$SOURCE" --out "$OUTPUT_DIR/Icon-20@3x.png"

# iPhone Settings icons
sips -z 58 58 "$SOURCE" --out "$OUTPUT_DIR/Icon-29@2x.png"
sips -z 87 87 "$SOURCE" --out "$OUTPUT_DIR/Icon-29@3x.png"

# iPhone Spotlight icons
sips -z 80 80 "$SOURCE" --out "$OUTPUT_DIR/Icon-40@2x.png"
sips -z 120 120 "$SOURCE" --out "$OUTPUT_DIR/Icon-40@3x.png"

# iPhone App icons
sips -z 120 120 "$SOURCE" --out "$OUTPUT_DIR/Icon-60@2x.png"
sips -z 180 180 "$SOURCE" --out "$OUTPUT_DIR/Icon-60@3x.png"

# iPad icons
sips -z 20 20 "$SOURCE" --out "$OUTPUT_DIR/Icon-20.png"
sips -z 29 29 "$SOURCE" --out "$OUTPUT_DIR/Icon-29.png"
sips -z 40 40 "$SOURCE" --out "$OUTPUT_DIR/Icon-40.png"
sips -z 76 76 "$SOURCE" --out "$OUTPUT_DIR/Icon-76.png"
sips -z 152 152 "$SOURCE" --out "$OUTPUT_DIR/Icon-76@2x.png"
sips -z 167 167 "$SOURCE" --out "$OUTPUT_DIR/Icon-83.5@2x.png"

# App Store icon
sips -z 1024 1024 "$SOURCE" --out "$OUTPUT_DIR/Icon-1024.png"

echo "App icons generated successfully in $OUTPUT_DIR"