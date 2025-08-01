#!/bin/bash

echo "iOS Provisioning Profile Setup Helper"
echo "===================================="
echo ""
echo "Current provisioning profile details:"
echo "- Name: Github CI App Store"
echo "- Bundle ID: LogYourBody.LogYourBody"
echo "- Widget Bundle ID: LogYourBody.LogYourBody.LogYourBodyWidget"
echo ""
echo "To fix the TestFlight deployment, you need to:"
echo ""
echo "1. Set the correct provisioning profile name in GitHub Secrets:"
echo "   gh secret set IOS_PROVISIONING_PROFILE_NAME -b 'Github CI App Store'"
echo ""
echo "2. The widget extension needs its own provisioning profile. Options:"
echo "   a) Create a wildcard profile for 'LogYourBody.LogYourBody.*'"
echo "   b) Create a specific profile for 'LogYourBody.LogYourBody.LogYourBodyWidget'"
echo "   c) Temporarily disable the widget extension in the build"
echo ""
echo "3. Current secrets that should be set:"
echo "   - IOS_P12_BASE64 (distribution certificate)"
echo "   - IOS_P12_PASSWORD (certificate password)"
echo "   - IOS_PROVISIONING_PROFILE_BASE64 (main app profile)"
echo "   - IOS_PROVISIONING_PROFILE_NAME='Github CI App Store'"
echo "   - ASC_API_KEY_JSON (App Store Connect API)"
echo "   - APPLE_TEAM_ID"
echo "   - APP_STORE_APP_ID"
echo ""
echo "To update the provisioning profile name now, run:"
echo "gh secret set IOS_PROVISIONING_PROFILE_NAME -b 'Github CI App Store'"