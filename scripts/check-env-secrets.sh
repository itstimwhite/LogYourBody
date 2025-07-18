#!/bin/bash

# Script to check which secrets are configured in each environment
# Usage: ./scripts/check-env-secrets.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Checking Environment Secrets Configuration"
echo "==========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Get repository
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
echo -e "${BLUE}Repository: $REPO${NC}"
echo ""

# Required secrets for each environment type
REQUIRED_SECRETS=(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
)

# Get list of environments
ENVIRONMENTS=$(gh api repos/$REPO/environments --jq '.environments[].name' 2>/dev/null || echo "")

if [ -z "$ENVIRONMENTS" ]; then
    echo -e "${RED}❌ No environments found.${NC}"
    exit 1
fi

echo "Checking each environment for Clerk secrets..."
echo ""

# Check each environment
echo "$ENVIRONMENTS" | while read -r env; do
    echo -e "${BLUE}📁 Environment: $env${NC}"
    
    # Get secrets for this environment
    SECRETS=$(gh api repos/$REPO/environments/$env/secrets --jq '.secrets[].name' 2>/dev/null || echo "")
    
    # Check each required secret
    all_present=true
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if echo "$SECRETS" | grep -q "^$secret$"; then
            echo -e "  ${GREEN}✅ $secret${NC}"
        else
            echo -e "  ${RED}❌ $secret (missing)${NC}"
            all_present=false
        fi
    done
    
    # Show other Clerk-related secrets
    OTHER_CLERK=$(echo "$SECRETS" | grep CLERK | grep -v -E "^(NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|CLERK_SECRET_KEY)$" || true)
    if [ -n "$OTHER_CLERK" ]; then
        echo -e "  ${YELLOW}ℹ️  Other Clerk secrets:${NC}"
        echo "$OTHER_CLERK" | while read -r secret; do
            echo -e "     - $secret"
        done
    fi
    
    if [ "$all_present" = true ]; then
        echo -e "  ${GREEN}✨ All required secrets present!${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Missing required secrets${NC}"
        echo -e "  Run: ${BLUE}./scripts/add-clerk-env-secrets.sh $env${NC}"
    fi
    
    echo ""
done

# Show which workflows use which environments
echo -e "${BLUE}Workflow Environment Usage:${NC}"
echo "- Web Rapid Loop (dev branch) → dev environment"
echo "- Web Confidence Loop (preview branch) → preview environment"  
echo "- Web Release Loop (main branch) → production environment"
echo ""

# Show repository-level secrets (if any)
echo -e "${BLUE}Repository-level secrets:${NC}"
REPO_SECRETS=$(gh secret list | grep CLERK || echo "No Clerk secrets at repository level")
echo "$REPO_SECRETS"
echo ""

echo -e "${YELLOW}Note: Secrets should be added to environments, not repository level.${NC}"