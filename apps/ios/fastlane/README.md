# Fastlane Setup for LogYourBody iOS

This directory contains the Fastlane configuration for automating iOS builds, tests, and deployments.

## Installation

1. Install Fastlane dependencies:
   ```bash
   bundle install
   ```

2. Copy the environment variables file and fill in your values:
   ```bash
   cp fastlane/.env.example fastlane/.env
   ```

## Available Lanes

### Development

- `fastlane lint` - Run SwiftLint
- `fastlane test` - Run unit tests
- `fastlane build_dev` - Build the app for development

### Deployment

- `fastlane beta` - Build and upload to TestFlight
- `fastlane release` - Build and upload to App Store

### CI/CD

- `fastlane ci_build` - Optimized build for CI environments

### Setup

- `fastlane setup_certificates` - Set up development certificates using match
- `fastlane setup_distribution` - Set up distribution certificates using match

## CI/CD Integration

The CI workflow uses Fastlane lanes instead of direct xcodebuild commands:

```yaml
- name: Run tests
  run: bundle exec fastlane test
  
- name: Build for CI
  run: bundle exec fastlane ci_build
```

## Environment Variables

Required environment variables (see `.env.example`):

- `APPLE_ID_EMAIL` - Your Apple ID email
- `APPLE_TEAM_ID` - Your Apple Developer Team ID
- `APP_STORE_APP_ID` - Your app's App Store ID
- `MATCH_PASSWORD` - Password for match encryption
- `MATCH_GIT_URL` - Git repository for storing certificates

## Troubleshooting

If you encounter issues:

1. Ensure all environment variables are set correctly
2. Run `bundle update fastlane` to get the latest version
3. Clear derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
4. Check Fastlane documentation: https://docs.fastlane.tools/