# LogYourBody Web App

Next.js application for tracking fitness and health metrics.

## CI/CD Status
- 🚀 Rapid Loop: < 5 min feedback on dev branch
- 🛡️ Confidence Loop: Nightly tests on preview branch
- 🎯 Release Loop: Production deployments from main branch

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test
npm run test:e2e
```

## Deployment

Deployments are automated via GitHub Actions:
- **Dev**: Push to dev branch → Vercel Alpha
- **Preview**: Auto-merge from dev → Vercel Beta
- **Production**: PR to main → Vercel Production

Last updated: 2025-07-17 - Three-loop CI/CD implemented