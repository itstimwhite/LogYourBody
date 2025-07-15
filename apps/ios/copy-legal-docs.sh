#!/bin/bash

# Script to copy shared legal documents into iOS app bundle

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
SHARED_LEGAL_DIR="$PROJECT_ROOT/shared/legal"
IOS_RESOURCES_DIR="$SCRIPT_DIR/LogYourBody/Resources/Legal"

# Create Resources/Legal directory if it doesn't exist
mkdir -p "$IOS_RESOURCES_DIR"

# Copy legal documents
echo "Copying legal documents..."

if [ -f "$SHARED_LEGAL_DIR/privacy-policy.md" ]; then
    cp "$SHARED_LEGAL_DIR/privacy-policy.md" "$IOS_RESOURCES_DIR/"
    echo "✓ Copied privacy-policy.md"
else
    echo "✗ privacy-policy.md not found"
fi

if [ -f "$SHARED_LEGAL_DIR/terms-of-service.md" ]; then
    cp "$SHARED_LEGAL_DIR/terms-of-service.md" "$IOS_RESOURCES_DIR/"
    echo "✓ Copied terms-of-service.md"
else
    echo "✗ terms-of-service.md not found"
fi

if [ -f "$SHARED_LEGAL_DIR/health-disclosure.md" ]; then
    cp "$SHARED_LEGAL_DIR/health-disclosure.md" "$IOS_RESOURCES_DIR/"
    echo "✓ Copied health-disclosure.md"
else
    echo "✗ health-disclosure.md not found"
fi

echo "Done!"