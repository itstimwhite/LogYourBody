#!/bin/bash

# Script to add iOS repository-level secrets
# Usage: ./scripts/add-ios-repo-secrets.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔐 iOS Repository Secrets Configuration"
echo "======================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed.${NC}"
    exit 1
fi

# Function to add a repository secret
add_repo_secret() {
    local secret_name=$1
    local prompt=$2
    local example=$3
    
    echo ""
    echo -e "${BLUE}📝 $secret_name${NC}"
    echo "$prompt"
    if [ -n "$example" ]; then
        echo -e "${YELLOW}Example: $example${NC}"
    fi
    echo -n "Enter value: "
    read secret_value
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⚠️  Skipping $secret_name (no value provided)${NC}"
        return
    fi
    
    echo "$secret_value" | gh secret set "$secret_name"
    echo -e "${GREEN}✅ $secret_name added${NC}"
}

echo "These secrets are shared across all environments."
echo ""

# Add APPLE_TEAM_ID
add_repo_secret "APPLE_TEAM_ID" \
    "Your Apple Developer Team ID (10 characters)" \
    "A1B2C3D4E5"

# Add APP_STORE_APP_ID  
add_repo_secret "APP_STORE_APP_ID" \
    "Your app's ID in App Store Connect" \
    "1234567890"

# Add IOS_PROVISIONING_PROFILE_NAME
add_repo_secret "IOS_PROVISIONING_PROFILE_NAME" \
    "The name of your provisioning profile" \
    "LogYourBody App Store"

echo ""
echo -e "${GREEN}🎉 Repository secrets configuration complete!${NC}"
echo ""

# Show current repository secrets
echo "Current repository secrets:"
gh secret list | grep -E "(APPLE_TEAM_ID|APP_STORE_APP_ID|IOS_PROVISIONING_PROFILE_NAME|ASC_API_KEY_JSON)" || echo "None found"

echo ""
echo "Next steps:"
echo "1. Add code signing secrets to each environment:"
echo "   ./scripts/add-ios-codesigning-secrets.sh development"
echo "   ./scripts/add-ios-codesigning-secrets.sh Preview"
echo "   ./scripts/add-ios-codesigning-secrets.sh Production"
echo "2. Push a commit to trigger iOS builds"