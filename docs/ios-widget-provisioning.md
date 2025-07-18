# iOS Widget Extension Provisioning

The LogYourBody app includes a widget extension that requires its own provisioning profile.

## Current Status

- Main app bundle ID: `LogYourBody.LogYourBody`
- Widget bundle ID: `LogYourBody.LogYourBody.LogYourBodyWidget`
- Current provisioning profile: `Github CI App Store` (only covers main app)

## Issue

The widget extension is causing build failures because it doesn't have a provisioning profile.

## Solutions

### Option 1: Create a Wildcard Profile (Recommended)
1. Go to Apple Developer Portal
2. Create a new App Store distribution profile
3. Use bundle ID: `LogYourBody.LogYourBody.*`
4. Name it: `Github CI App Store Wildcard`
5. Download and add to GitHub secrets

### Option 2: Create Specific Widget Profile
1. Go to Apple Developer Portal
2. Create a new App Store distribution profile
3. Use bundle ID: `LogYourBody.LogYourBody.LogYourBodyWidget`
4. Name it: `Github CI Widget`
5. Update Fastfile to include both profiles

### Option 3: Disable Widget (Temporary)
Currently implemented as a temporary solution.

## To Fix Properly

1. Create the wildcard provisioning profile in Apple Developer Portal
2. Download the new `.mobileprovision` file
3. Base64 encode it: `base64 -i profile.mobileprovision | pbcopy`
4. Update GitHub secret: `gh secret set IOS_PROVISIONING_PROFILE_BASE64`
5. Revert the Fastfile changes to use `ENV["IOS_PROVISIONING_PROFILE_NAME"]`

## GitHub Secrets Required

```bash
# Set the correct profile name
gh secret set IOS_PROVISIONING_PROFILE_NAME -b "Github CI App Store"
```