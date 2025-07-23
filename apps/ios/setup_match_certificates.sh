#!/bin/bash

echo "Setting up Match certificates..."
echo "This will create new certificates and push them to your repository."
echo ""

# Ensure we're in the iOS directory
cd "$(dirname "$0")"

# Check if certificates already exist
echo "Checking existing certificates..."
bundle exec fastlane match appstore --readonly || {
    echo ""
    echo "No valid certificates found. Would you like to create them? (y/n)"
    read -r response
    
    if [[ "$response" == "y" ]]; then
        echo "Creating new certificates..."
        echo "This will:"
        echo "1. Create a new distribution certificate"
        echo "2. Create a new provisioning profile"
        echo "3. Encrypt and push them to your git repository"
        echo ""
        echo "Make sure you have:"
        echo "- Access to create certificates on App Store Connect"
        echo "- Write access to the certificates repository"
        echo ""
        echo "Press Enter to continue or Ctrl+C to cancel..."
        read -r
        
        # Run match to create certificates
        bundle exec fastlane match appstore --force
        
        echo ""
        echo "✅ Certificates created successfully!"
        echo "You can now use these certificates in CI/CD"
    else
        echo "Skipping certificate creation."
    fi
}

echo ""
echo "Testing certificates in readonly mode..."
bundle exec fastlane match appstore --readonly

echo ""
echo "Done!"