#!/bin/bash

echo "🔨 Building LogYourBody with xcodebuild"
echo "======================================="

cd "$(dirname "$0")"

# Clean and build
echo "🧹 Cleaning..."
xcodebuild clean -project LogYourBody.xcodeproj -scheme LogYourBody

echo ""
echo "📱 Building..."
xcodebuild build \
    -project LogYourBody.xcodeproj \
    -scheme LogYourBody \
    -configuration Debug \
    -sdk iphonesimulator \
    -destination 'platform=iOS Simulator,name=iPhone 15'

# Check result
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build succeeded!"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi