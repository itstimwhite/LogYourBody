#!/bin/bash

echo "🔨 Building LogYourBody with Xcode CLI"
echo "======================================"

# Navigate to the project directory
cd "$(dirname "$0")"

# Set variables
PROJECT_NAME="LogYourBody"
SCHEME_NAME="LogYourBody"
CONFIGURATION="Debug"
DERIVED_DATA_PATH="./DerivedData"
BUILD_PATH="./build"

# Clean previous builds
echo ""
echo "🧹 Cleaning previous builds..."
rm -rf "$DERIVED_DATA_PATH"
rm -rf "$BUILD_PATH"

# Clean the project
echo ""
echo "🧹 Cleaning project..."
xcodebuild clean \
    -project "${PROJECT_NAME}.xcodeproj" \
    -scheme "$SCHEME_NAME" \
    -configuration "$CONFIGURATION" \
    -derivedDataPath "$DERIVED_DATA_PATH"

# Build for iOS Simulator
echo ""
echo "📱 Building for iOS Simulator..."
xcodebuild build \
    -project "${PROJECT_NAME}.xcodeproj" \
    -scheme "$SCHEME_NAME" \
    -configuration "$CONFIGURATION" \
    -sdk iphonesimulator \
    -derivedDataPath "$DERIVED_DATA_PATH" \
    -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest' \
    ONLY_ACTIVE_ARCH=NO \
    BUILD_DIR="$BUILD_PATH" \
    | xcpretty

# Check if build succeeded
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "✅ Build succeeded!"
    echo ""
    echo "📁 Build products location:"
    echo "   $BUILD_PATH/$CONFIGURATION-iphonesimulator/"
    
    # Optional: List the app bundle
    echo ""
    echo "📱 App bundle:"
    ls -la "$BUILD_PATH/$CONFIGURATION-iphonesimulator/" | grep ".app"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

# Optional: Run the app in simulator
echo ""
read -p "Would you like to run the app in the simulator? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Launching app in simulator..."
    
    # Open the simulator
    open -a "Simulator"
    
    # Wait for simulator to boot
    echo "⏳ Waiting for simulator to boot..."
    xcrun simctl boot "iPhone 15" 2>/dev/null || true
    sleep 5
    
    # Install and launch the app
    APP_PATH="$BUILD_PATH/$CONFIGURATION-iphonesimulator/${PROJECT_NAME}.app"
    if [ -d "$APP_PATH" ]; then
        echo "📲 Installing app..."
        xcrun simctl install "iPhone 15" "$APP_PATH"
        
        echo "🚀 Launching app..."
        xcrun simctl launch "iPhone 15" "com.yourcompany.${PROJECT_NAME}"
    else
        echo "❌ App bundle not found at: $APP_PATH"
    fi
fi