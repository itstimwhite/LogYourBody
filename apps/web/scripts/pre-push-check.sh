#!/bin/bash

# Pre-push check script
# Runs all the same checks that CI will run

set -e  # Exit on any error

echo "🔍 Running pre-push checks..."
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo ""
fi

# 1. Linting
echo "📝 Running ESLint..."
npm run lint
if [ $? -eq 0 ]; then
    echo "✅ Linting passed"
else
    echo "❌ Linting failed"
    exit 1
fi
echo ""

# 2. Type checking
echo "🔍 Running TypeScript type check..."
npm run typecheck
if [ $? -eq 0 ]; then
    echo "✅ Type checking passed"
else
    echo "❌ Type checking failed"
    exit 1
fi
echo ""

# 3. Tests
echo "🧪 Running tests..."
npm test
if [ $? -eq 0 ]; then
    echo "✅ Tests passed"
else
    echo "❌ Tests failed"
    exit 1
fi
echo ""

# 4. Build check (optional, can be slow)
if [[ "$1" == "--with-build" ]]; then
    echo "🏗️  Running build check..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Build passed"
    else
        echo "❌ Build failed"
        exit 1
    fi
    echo ""
fi

echo "🎉 All checks passed! Ready to push."
echo ""
echo "💡 Tip: To also run a build check, use: npm run check:all"