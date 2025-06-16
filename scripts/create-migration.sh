#!/bin/bash

# Script to create a new Supabase migration file
# Usage: ./scripts/create-migration.sh "descriptive name"

if [ -z "$1" ]; then
  echo "Usage: $0 \"descriptive name\""
  echo "Example: $0 \"add user preferences\""
  exit 1
fi

# Convert description to snake_case
DESCRIPTION=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr '-' '_')

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create filename
FILENAME="${TIMESTAMP}_${DESCRIPTION}.sql"
FILEPATH="supabase/migrations/${FILENAME}"

# Get author name from git config
AUTHOR=$(git config user.name || echo "Unknown")
DATE=$(date +"%Y-%m-%d")

# Create migration file from template
cat > "$FILEPATH" << EOF
-- Migration: ${DESCRIPTION}
-- 
-- Purpose: ${1}
-- Author: ${AUTHOR}
-- Date: ${DATE}

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your migration SQL here


-- =====================================================
-- DOWN MIGRATION (commented out for safety)
-- =====================================================
-- Only uncomment and run if you need to rollback

-- Add your rollback SQL here (commented out)

EOF

echo "✅ Created migration file: $FILEPATH"
echo ""
echo "Next steps:"
echo "1. Edit the migration file to add your SQL"
echo "2. Test locally: supabase db push --local"
echo "3. Commit and push to trigger CI/CD migrations"