const fs = require('fs');
const path = require('path');

// Files to remove
const filesToRemove = [
  'AUTH_FIX_INSTRUCTIONS.md',
  'AUTH_FIX_SUMMARY.md',
  'AVATAR_SYSTEM.md',
  'IMPLEMENTATION_SUMMARY.md',
  'NEXTJS_MIGRATION_PLAN.md',
  'NEXTJS_ROUTE_CONVERSION.md',
  'NEXTJS_TECHNICAL_GUIDE.md',
  'VERCEL_ENV_CONFIG.md',
  'VERCEL_ENV_SETUP.md',
  'SUPABASE_MULTI_ENV_SETUP.md',
  'REMOVE_EMAIL_SUBSCRIPTION_TRIGGER.sql',
  'RESTORE_AUTH_SYSTEM.sql',
  'vercel-local.json',
  'vercel-preview.json',
  'cleanup-reorganization.sh',
  'temp-cleanup.txt',
  'tsconfig.tsbuildinfo'
];

// Directories to remove
const dirsToRemove = [
  'next-app',
  'dist'
];

console.log('🧹 Cleaning up temporary files...');

// Remove files
filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed: ${file}`);
    } else {
      console.log(`⚠️  Not found: ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error removing ${file}:`, error.message);
  }
});

// Remove directories
dirsToRemove.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dir}`);
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  } catch (error) {
    console.log(`❌ Error removing directory ${dir}:`, error.message);
  }
});

console.log('\n✅ Cleanup complete!');
console.log('\n📁 Final structure:');
console.log('├── src/                 (Next.js 15 App Router)');
console.log('├── public/              (Static assets)');
console.log('├── legacy-react/        (Original React app)');
console.log('├── ios/                 (Capacitor iOS)');
console.log('├── supabase/            (Database migrations)');
console.log('├── scripts/             (Build scripts)');
console.log('├── package.json         (Next.js dependencies)');
console.log('├── vercel.json          (Deployment config)');
console.log('└── .env.local           (Environment variables)');