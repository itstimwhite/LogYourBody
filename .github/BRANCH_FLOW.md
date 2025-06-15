# LogYourBody Branch Flow & CI/CD

## 🌊 Branch Flow

```
dev ──(green CI auto-sync)──► preview ──(manual PR)──► main
```

### Branch Purposes

- **`dev`** - Active development branch
  - All feature development happens here
  - Runs full test suite + Next.js build
  - Auto-syncs to `preview` on successful CI

- **`preview`** - Staging environment
  - Always contains the latest passing state from `dev`
  - Deploys to Vercel Preview environment
  - Used for manual testing and review

- **`main`** - Production branch
  - Stable production code
  - Manual PR merge from `preview` only
  - Deploys to Vercel Production environment

## 🚀 CI/CD Workflows

### 1. Dev Branch CI (`.github/workflows/ci-dev.yml`)
**Triggers:** Push to `dev` or PR to `dev`

**Steps:**
1. Setup Node.js + pnpm with caching
2. Install dependencies
3. Run linting (`pnpm lint`)
4. Run type checking (`pnpm tsc --noEmit`) 
5. Run tests (`pnpm test`)
6. Build Next.js app (`pnpm build`)
7. Run Supabase migrations (dev environment)
8. **On success:** Auto-sync `dev` → `preview` (fast-forward merge)

### 2. Preview Branch CI (`.github/workflows/ci-preview.yml`)
**Triggers:** Push to `preview`

**Steps:**
1. Setup Node.js + pnpm with caching
2. Install dependencies
3. Run linting and type checking
4. Run tests (preview environment)
5. Build Next.js app
6. Run Supabase migrations (preview environment)
7. Optional: E2E tests with Playwright (commented out)

**Note:** Vercel auto-deploys the `preview` branch to staging

### 3. Main Branch CI (`.github/workflows/ci-main.yml`)
**Triggers:** Push to `main` or PR to `main`

**Steps:**
1. Setup Node.js + pnpm with caching
2. Install dependencies
3. Run smoke tests (lint + type check only)
4. Build production bundle
5. Run Supabase migrations (production environment)
6. Post-deployment verification

## 🔧 Required Repository Secrets

### Supabase Configuration
| Secret | Purpose |
|--------|---------|
| `SUPA_DEV_URL` | Supabase URL for dev environment |
| `SUPA_DEV_ANON_KEY` | Supabase anon key for dev |
| `SUPA_DEV_REF` | Supabase project ref for dev |
| `SUPA_PRE_URL` | Supabase URL for preview environment |
| `SUPA_PRE_ANON_KEY` | Supabase anon key for preview |
| `SUPA_PRE_REF` | Supabase project ref for preview |
| `SUPA_PROD_URL` | Supabase URL for production |
| `SUPA_PROD_ANON_KEY` | Supabase anon key for production |
| `SUPA_PROD_REF` | Supabase project ref for production |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token |

### GitHub Configuration
| Secret | Purpose |
|--------|---------|
| `GITHUB_TOKEN` | GitHub Actions token (auto-provided) |

## 📋 How to Use

### Daily Development
1. Work on `dev` branch
2. Push commits to `dev`
3. CI runs automatically
4. On success, `dev` auto-syncs to `preview`
5. Check staging at `https://preview-logyourbody.vercel.app`

### Promoting to Production
1. Create PR: `preview` → `main`
2. Review changes in PR
3. Merge PR to trigger production deployment
4. Production deploys to `https://logyourbody.com`

### Emergency Hotfixes
1. Create hotfix branch from `main`
2. Make minimal changes
3. PR hotfix → `main` directly
4. After merge, sync changes back to `dev` and `preview`

## 🛠️ Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Run linting
pnpm lint
```

## 🔍 Troubleshooting

### Auto-sync Fails
If the `dev` → `preview` auto-sync fails (merge conflicts):
1. Manually merge `dev` into `preview`
2. Resolve conflicts
3. Push to `preview`

### Failed CI
- Check the Actions tab in GitHub
- Look for specific error messages
- Ensure all secrets are properly configured
- Verify Supabase environment variables

### Migration Issues
- Supabase migrations run with `|| true` on dev/preview (non-blocking)
- Production migrations are blocking and will fail the deployment if they error
- Always test migrations on dev/preview first