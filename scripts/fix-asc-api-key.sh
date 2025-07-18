#!/bin/bash

echo "🔧 Fix ASC API Key Format"
echo ""
echo "This script will help you properly format the ASC_API_KEY_JSON secret."
echo ""

# Check if we have the necessary files
if [ ! -f "$HOME/Downloads/AuthKey_A76CPV6UUL.p8" ]; then
    echo "❌ AuthKey_A76CPV6UUL.p8 not found in Downloads"
    echo "Please ensure the file is in your Downloads folder"
    exit 1
fi

echo "📋 Step 1: Enter your App Store Connect Issuer ID"
echo "You can find this at: https://appstoreconnect.apple.com/access/api"
echo ""
read -p "Issuer ID: " ISSUER_ID

if [ -z "$ISSUER_ID" ]; then
    echo "❌ Issuer ID is required"
    exit 1
fi

echo ""
echo "📝 Step 2: Creating properly formatted JSON..."

# Read the key file and escape newlines
KEY_CONTENT=$(cat "$HOME/Downloads/AuthKey_A76CPV6UUL.p8" | sed ':a;N;$!ba;s/\n/\\n/g')

# Create the JSON
JSON=$(cat <<EOF
{"key_id":"A76CPV6UUL","issuer_id":"$ISSUER_ID","key":"$KEY_CONTENT","in_house":false}
EOF
)

echo ""
echo "✅ JSON created successfully!"
echo ""
echo "📋 Step 3: Update the GitHub secret"
echo ""
echo "Run this command to update the secret:"
echo ""
echo "gh secret set ASC_API_KEY_JSON --body '$JSON' --env development"
echo ""
echo "Then also set it for Preview and Production environments:"
echo "gh secret set ASC_API_KEY_JSON --body '$JSON' --env Preview"
echo "gh secret set ASC_API_KEY_JSON --body '$JSON' --env Production"
echo ""
echo "⚠️  IMPORTANT: Copy the ENTIRE JSON string above (including quotes) when setting the secret"