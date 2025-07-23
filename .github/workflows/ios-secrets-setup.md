# GitHub Actions Secrets for iOS CI/CD with Match

Set up these secrets in your GitHub repository settings:

## Required Secrets

### 1. App Store Connect API Key
- **Secret Name**: `APP_STORE_CONNECT_API_KEY`
- **Value**: The contents of your private key (-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----)
- **How to get**: From your api_key.json file, copy just the key content

### 2. App Store Connect API Key ID
- **Secret Name**: `APP_STORE_CONNECT_API_KEY_ID`
- **Value**: V9NW6ZGUK3

### 3. App Store Connect API Issuer ID
- **Secret Name**: `APP_STORE_CONNECT_API_ISSUER_ID`
- **Value**: c195f569-ff16-40fa-aaff-4fe94e8139ad

### 4. Match Password
- **Secret Name**: `MATCH_PASSWORD`
- **Value**: Your Match encryption password (the new one you just set)

### 5. Match Git URL (Optional - can be in workflow)
- **Secret Name**: `MATCH_GIT_URL`
- **Value**: https://github.com/itstimwhite/certificates.git

### 6. Apple Team ID
- **Secret Name**: `APPLE_TEAM_ID`
- **Value**: 6P36X5723P

### 7. App Store App ID
- **Secret Name**: `APP_STORE_APP_ID`
- **Value**: 6470661673

### 8. Match Git Token (for private repository)
- **Secret Name**: `MATCH_GIT_TOKEN`
- **Value**: Your GitHub Personal Access Token
- **How to create**: 
  1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
  2. Click "Generate new token" (classic)
  3. Give it a descriptive name like "Match Certificates Access"
  4. Select the `repo` scope (Full control of private repositories)
  5. Click "Generate token"
  6. Copy the token value (starts with `ghp_` or similar)
  7. Use this token value directly as the secret (not base64 encoded)

## Setting Up Secrets

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with the name and value listed above

## Notes

- The API key should be the raw private key content, not base64 encoded
- Make sure there are no extra spaces or newlines when copying values
- The Match password should be the one you just changed to