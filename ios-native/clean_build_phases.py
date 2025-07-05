#!/usr/bin/env python3

import re

print("🔧 Cleaning build phase references")
print("==================================")

pbxproj_path = "LogYourBody.xcodeproj/project.pbxproj"

# Read the project file
with open(pbxproj_path, 'r') as f:
    content = f.read()

# Remove build file references for missing files
missing_files = ['SupabaseClient.swift', 'SupabaseManager.swift']

for file_name in missing_files:
    # Pattern to match build file entries
    pattern = r'[A-F0-9]{24} /\* ' + re.escape(file_name) + r' in Sources \*/ = \{isa = PBXBuildFile; fileRef = [^}]*\};'
    content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # Pattern to match references in build phases
    pattern = r'[A-F0-9]{24} /\* ' + re.escape(file_name) + r' in Sources \*/,?\s*'
    content = re.sub(pattern, '', content)
    
    print(f"✓ Removed build phase references for {file_name}")

# Clean up formatting
content = re.sub(r',\s*,', ',', content)
content = re.sub(r',\s*\)', ')', content)
content = re.sub(r',\s*\}', '}', content)
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

# Write back
with open(pbxproj_path, 'w') as f:
    f.write(content)

print("\n✅ Build phases cleaned!")