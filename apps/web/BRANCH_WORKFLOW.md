# Branch Workflow Documentation

## Branch Structure

This repository follows a strict **dev → preview → main** workflow to ensure code quality and proper deployment practices.

### Branch Purposes

- **`dev`** - Primary development branch, always ahead of other branches
- **`preview`** - Staging branch for testing before production
- **`main`** - Production branch, only receives tested code from preview

## Workflow Rules

### ✅ Allowed Operations

1. **Direct commits to `dev`** - All development work happens here
2. **Merge `dev` → `preview`** - When features are ready for staging
3. **Merge `preview` → `main`** - When staging tests pass and ready for production

### ❌ Prohibited Operations

1. **Direct commits to `main`** - Protected branch
2. **Direct commits to `preview`** - Protected branch  
3. **Merge `main` → `preview`** - Wrong direction
4. **Merge `main` → `dev`** - Wrong direction
5. **Skip preview** - Never merge `dev` directly to `main`

## Branch Protection Rules

### Main Branch Protection
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

### Preview Branch Protection
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

### Dev Branch (Default)
- ✅ Allow direct pushes
- ✅ Run CI/CD tests on all commits
- ✅ Default branch for new clones

## Deployment Pipeline

### Development (`dev` branch)
- **Vercel Environment**: Development
- **Domain**: `dev-logyourbody.vercel.app`
- **Automatic Deploy**: On every push to dev
- **Environment Variables**: From `.env` (development values)

### Staging (`preview` branch)
- **Vercel Environment**: Preview
- **Domain**: `preview-logyourbody.vercel.app`
- **Automatic Deploy**: On every push to preview
- **Environment Variables**: From `.env.local` (staging values)
- **Tests Required**: Must pass all tests before deployment

### Production (`main` branch)
- **Vercel Environment**: Production
- **Domain**: `logyourbody.com`
- **Automatic Deploy**: On every push to main
- **Environment Variables**: From `.env.production` (production values)
- **Tests Required**: Must pass all tests and staging validation

## Versioning Strategy

### Automatic Versioning
- **Format**: `YYYY.MM.PATCH` (e.g., 2025.06.15)
- **Trigger**: Pre-push hook and GitHub Actions
- **Scope**: Runs on `dev`, `preview`, and `main` branches
- **Changelog**: Automatically updated with commit messages

### Version Increments
- **New Month/Year**: Resets to `.0`
- **Same Month**: Increments patch number
- **Manual Override**: Use `--force` flag if needed

## Common Workflows

### Feature Development
```bash
# Start on dev branch
git checkout dev
git pull origin dev

# Create feature
git add .
git commit -m "feat: add new feature"
git push origin dev

# Deploy to staging when ready
git checkout preview
git merge dev --no-ff
git push origin preview

# Deploy to production when staging tests pass
git checkout main
git merge preview --no-ff
git push origin main

# Return to dev for next feature
git checkout dev
```

### Hotfix Process
```bash
# Emergency fix starts on dev
git checkout dev
git add .
git commit -m "fix: critical security issue"
git push origin dev

# Fast-track through preview to main
git checkout preview
git merge dev --no-ff
git push origin preview

# Verify in staging, then to production
git checkout main
git merge preview --no-ff
git push origin main

git checkout dev
```

### Environment Configuration

All environment files are sorted alphabetically and synchronized:
- `.env` - Development environment
- `.env.local` - Staging/Preview environment (Vercel CLI format)
- `.env.production` - Production environment (minimal, secure)
- `.env.example` - Template for new developers

## CI/CD Pipeline

### Development Tests (`dev` branch)
- ✅ Run unit tests (`npm test`)
- ✅ Type checking (`npm run typecheck`)
- ✅ Build verification (`npm run build:prod`)
- ✅ Code formatting check (`npm run format.fix --check`)

### Staging Tests (`preview` branch)
- ✅ All development tests
- ✅ Integration tests
- ✅ Performance testing
- ✅ Security scanning

### Production Deployment (`main` branch)
- ✅ All staging tests
- ✅ Automated version bumping
- ✅ Git tag creation
- ✅ Production build optimization

## Manual Setup Required

The following GitHub settings need to be configured manually:

### 1. Default Branch
```
Repository Settings → General → Default branch: dev
```

### 2. Branch Protection Rules
```
Repository Settings → Branches → Add rule

For 'main':
✅ Require pull request reviews before merging
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
✅ Include administrators

For 'preview':
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
✅ Include administrators
```

### 3. Vercel Integration
```
Vercel Dashboard → Project Settings → Git

Production Branch: main
Preview Branches: preview
Development Branch: dev

Environment Variables:
- Production: Use .env.production values
- Preview: Use .env.local values  
- Development: Use .env values
```

### 4. GitHub Repository Settings
```
Repository Settings → General → Features:
✅ Issues
✅ Projects
✅ Wiki
✅ Discussions
❌ Sponsorships

Pull Requests:
✅ Allow merge commits
✅ Allow squash merging
❌ Allow rebase merging (to maintain clear history)
✅ Always suggest updating pull request branches
✅ Automatically delete head branches
```

## Troubleshooting

### Branch Out of Sync
```bash
# If preview/main get ahead of dev somehow
git checkout dev
git pull origin main  # Pull latest production code
git push origin dev   # Update dev to be current
```

### Failed Deployments
1. Check GitHub Actions for test failures
2. Verify environment variables in Vercel
3. Ensure branch protection rules are not blocking
4. Check Vercel build logs for specific errors

### Version Conflicts
```bash
# Reset version if needed
git checkout dev
node scripts/version-manager.cjs --force
git push origin dev
```

## Best Practices

1. **Always start features on `dev`**
2. **Test thoroughly in preview before main**
3. **Never skip the preview stage**
4. **Keep commits atomic and well-described**
5. **Use conventional commit messages** (feat:, fix:, chore:)
6. **Review environment variables regularly**
7. **Monitor deployment status on all branches**

This workflow ensures:
- ✅ Code quality through multiple testing stages
- ✅ Safe deployments with rollback capability
- ✅ Clear deployment pipeline visibility
- ✅ Automatic versioning and changelog generation
- ✅ Protection against accidental production deployments