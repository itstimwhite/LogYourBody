#!/usr/bin/env python3

import os
import re
import shutil
from datetime import datetime
import plistlib
import json

print("🔧 Automated Xcode Project Fixer")
print("================================")

# Find the .xcodeproj directory
xcodeproj_path = None
for item in os.listdir('.'):
    if item.endswith('.xcodeproj'):
        xcodeproj_path = item
        break

if not xcodeproj_path:
    print("❌ No .xcodeproj file found!")
    exit(1)

print(f"📱 Found project: {xcodeproj_path}")

# Backup the project file
backup_dir = f"project_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
os.makedirs(backup_dir, exist_ok=True)
shutil.copytree(xcodeproj_path, os.path.join(backup_dir, xcodeproj_path))
print(f"📦 Backup created: {backup_dir}")

# Path to the project.pbxproj file
pbxproj_path = os.path.join(xcodeproj_path, 'project.pbxproj')

print("\n🔍 Analyzing project file...")

# Read the project file
with open(pbxproj_path, 'r') as f:
    content = f.read()

# Track changes
changes_made = []

# 1. Find and remove duplicate file references
print("\n📋 Checking for duplicate files...")

# Extract all file references
file_pattern = r'/\* (.+?) \*/ = \{isa = PBXFileReference;.+?path = "?(.+?)"?;'
file_refs = re.findall(file_pattern, content)

# Find duplicates
seen_files = {}
duplicate_refs = []

for match in re.finditer(r'([A-F0-9]{24}) /\* (.+?) \*/ = \{isa = PBXFileReference;.+?path = "?(.+?)"?;.+?\};', content, re.DOTALL):
    ref_id = match.group(1)
    file_name = match.group(2)
    file_path = match.group(3)
    
    if file_path in seen_files:
        duplicate_refs.append((ref_id, file_name, file_path))
        print(f"  ⚠️  Duplicate found: {file_path}")
    else:
        seen_files[file_path] = ref_id

# Remove duplicate Config.xcconfig if found
for ref_id, file_name, file_path in duplicate_refs:
    if 'Config.xcconfig' in file_path and 'LogYourBody/Config.xcconfig' in file_path:
        print(f"  🗑️  Removing duplicate Config.xcconfig reference...")
        # Remove the file reference
        pattern = f'{ref_id} /\\* .+? \\*/ = \\{{isa = PBXFileReference;.+?\\}};'
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        # Remove from groups
        content = re.sub(f'{ref_id} /\\* .+? \\*/,?', '', content)
        changes_made.append(f"Removed duplicate Config.xcconfig")

# 2. Remove empty file references
print("\n🗑️  Removing empty file references...")
empty_files = ['SupabaseClient.swift', 'SupabaseManager.swift', 'Package.swift']

for empty_file in empty_files:
    # Find references to empty files
    pattern = r'([A-F0-9]{24}) /\* ' + re.escape(empty_file) + r' \*/ = \{isa = PBXFileReference;.+?\};'
    matches = re.findall(pattern, content, re.DOTALL)
    
    for ref_id in matches:
        print(f"  🗑️  Removing {empty_file} reference...")
        # Remove the file reference
        pattern = f'{ref_id} /\\* {re.escape(empty_file)} \\*/ = \\{{isa = PBXFileReference;.+?\\}};'
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        # Remove from groups
        content = re.sub(f'{ref_id} /\\* {re.escape(empty_file)} \\*/,?', '', content)
        # Remove from build phases
        content = re.sub(f'{ref_id} /\\* {re.escape(empty_file)} in .+? \\*/,?', '', content)
        changes_made.append(f"Removed {empty_file}")

# 3. Clean up build phases
print("\n🔨 Cleaning build phases...")

# Find duplicate entries in Copy Bundle Resources
resources_section = re.search(r'\/\* Copy Bundle Resources \*\/ = \{[^}]+files = \(([^)]+)\)', content, re.DOTALL)
if resources_section:
    files_list = resources_section.group(1)
    # Remove duplicate entries
    unique_files = []
    seen = set()
    for line in files_list.split(','):
        line = line.strip()
        if line and line not in seen:
            seen.add(line)
            unique_files.append(line)
    
    new_files_list = ',\n\t\t\t\t'.join(unique_files)
    content = content.replace(files_list, new_files_list)
    changes_made.append("Cleaned up Copy Bundle Resources")

# 4. Fix trailing commas and clean up
print("\n🧹 Cleaning up project file...")
# Remove multiple consecutive commas
content = re.sub(r',\s*,', ',', content)
# Remove trailing commas before closing brackets
content = re.sub(r',\s*\)', ')', content)
content = re.sub(r',\s*\}', '}', content)
# Remove empty lines in arrays
content = re.sub(r'\(\s*\)', '()', content)

# Write the cleaned project file
with open(pbxproj_path, 'w') as f:
    f.write(content)

print(f"\n✅ Project file cleaned! {len(changes_made)} changes made:")
for change in changes_made:
    print(f"   - {change}")

# Create a summary report
report = f"""
# Xcode Project Cleanup Report

## Changes Made:
{chr(10).join(f'- {change}' for change in changes_made)}

## Backup Location:
{backup_dir}

## Next Steps:
1. Open Xcode
2. Clean Build Folder (Cmd + Shift + K)
3. Build (Cmd + B)

## If Issues Occur:
Restore from backup:
```bash
rm -rf {xcodeproj_path}
cp -r {backup_dir}/{xcodeproj_path} .
```
"""

with open('CLEANUP_REPORT.md', 'w') as f:
    f.write(report)

print("\n📋 Cleanup report saved to CLEANUP_REPORT.md")
print("\n🎉 Done! Now open Xcode and build your project.")