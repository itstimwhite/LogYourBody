#!/bin/bash

# Blender Avatar Renderer Script
# Renders 20 human-like torso avatars using Blender

echo "🎨 Starting Blender human avatar rendering..."

# Check if Blender is installed and available
if ! command -v blender &> /dev/null; then
    echo "❌ Blender not found in PATH"
    echo "Please install Blender or add it to your PATH"
    echo "You can download Blender from: https://www.blender.org/download/"
    echo ""
    echo "On macOS, if Blender is installed in Applications:"
    echo "export PATH=\"/Applications/Blender.app/Contents/MacOS:\$PATH\""
    exit 1
fi

# Get Blender version
BLENDER_VERSION=$(blender --version | head -n 1)
echo "✓ Found: $BLENDER_VERSION"

# Check if we're in the correct directory
if [ ! -f "scripts/blender-avatar-renderer.py" ]; then
    echo "❌ Please run this script from the project root directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Create backup of existing avatars
if [ -d "public/avatars" ] && [ "$(ls -A public/avatars)" ]; then
    echo "📦 Backing up existing avatars..."
    mkdir -p "public/avatars-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r public/avatars/* "public/avatars-backup-$(date +%Y%m%d-%H%M%S)/"
fi

echo "🚀 Starting Blender rendering..."
echo "This will generate 20 human-like torso avatars (10 body fat levels × 2 genders)"
echo "Estimated time: 5-10 minutes depending on your hardware"
echo ""

# Run Blender in background mode with our script
blender --background --python scripts/blender-avatar-renderer.py

# Check if rendering was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Blender rendering completed successfully!"
    echo "📁 Avatars saved to: public/avatars/"
    
    # List generated files
    if [ -d "public/avatars" ]; then
        echo ""
        echo "Generated avatars:"
        ls -la public/avatars/*.png 2>/dev/null | wc -l | xargs echo "Total PNG files:"
        ls public/avatars/*.png 2>/dev/null | head -5
        if [ $(ls public/avatars/*.png 2>/dev/null | wc -l) -gt 5 ]; then
            echo "... and more"
        fi
    fi
    
    echo ""
    echo "🎯 Next steps:"
    echo "1. Review the generated avatars in public/avatars/"
    echo "2. If satisfied, commit and push the changes"
    echo "3. Build and deploy the app with: npm run build"
    
else
    echo ""
    echo "❌ Blender rendering failed!"
    echo "Check the output above for error details"
    exit 1
fi