#!/usr/bin/env python3
import re

def remove_duplicate_build_files():
    # Read the project file
    with open('LogYourBody.xcodeproj/project.pbxproj', 'r') as f:
        content = f.read()

    # Simple approach: remove lines containing duplicate references
    # Look for the specific warnings we saw
    duplicate_patterns = [
        r'.*LaunchScreen\.storyboard.*',
        r'.*app-icon-180\.png.*',
        r'.*Supabase\.xcconfig.*',
        r'.*AppIconGuide\.md.*',
        r'.*Preview Assets\.xcassets.*',
        r'.*Assets\.xcassets.*',
    ]
    
    lines = content.split('\n')
    cleaned_lines = []
    removed_count = 0
    
    for line in lines:
        should_remove = False
        # Check if this line contains a duplicate file reference
        for pattern in duplicate_patterns:
            if re.search(pattern, line) and 'fileRef' in line:
                # Check if we already have this file in our cleaned lines
                for existing_line in cleaned_lines:
                    if re.search(pattern, existing_line) and 'fileRef' in existing_line:
                        should_remove = True
                        removed_count += 1
                        break
                break
        
        if not should_remove:
            cleaned_lines.append(line)
    
    # Write back
    with open('LogYourBody.xcodeproj/project.pbxproj', 'w') as f:
        f.write('\n'.join(cleaned_lines))
    
    print(f'Removed {removed_count} duplicate references')

if __name__ == '__main__':
    remove_duplicate_build_files()