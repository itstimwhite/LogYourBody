#!/bin/bash

# Setup Git hooks

echo "🔧 Setting up Git hooks..."

# Configure Git to use our hooks directory
git config core.hooksPath .githooks

echo "✅ Git hooks configured!"
echo ""
echo "The pre-push hook will now run automatically before each push."
echo "To disable: git config --unset core.hooksPath"