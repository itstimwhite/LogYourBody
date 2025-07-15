#!/bin/bash

# Script to remove duplicate build phase entries from Xcode project

PROJECT_FILE="LogYourBody.xcodeproj/project.pbxproj"

# Backup the original file
cp "$PROJECT_FILE" "${PROJECT_FILE}.backup"

# Remove duplicate README.md from Resources build phase
# Keep the first one (AD0055022E22290C0029E0FF) and remove the second (AD723B162E15FA5D002376C6)
sed -i '' '/AD723B162E15FA5D002376C6 \/\* README.md in Resources \*\//d' "$PROJECT_FILE"

# Remove duplicate DesignSystem.swift from Sources build phase
# Keep the most recent one (AD0055062E22290C0029E0FF) and remove the others
sed -i '' '/ADF5C1E02E1E011200E3FB4D \/\* DesignSystem.swift in Sources \*\//d' "$PROJECT_FILE"
sed -i '' '/ADF5C1BA2E1DFE3100E3FB4D \/\* DesignSystem.swift in Sources \*\//d' "$PROJECT_FILE"

echo "Removed duplicate build phase entries."
echo "Original file backed up as ${PROJECT_FILE}.backup"
echo ""
echo "Please open Xcode and:"
echo "1. Clean Build Folder (Cmd+Shift+K)"
echo "2. Close and reopen the project"
echo "3. Build again (Cmd+B)"