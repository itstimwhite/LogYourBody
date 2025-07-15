#!/usr/bin/env python3

import re
import os
import subprocess
import json

def get_space_after_comment_violations():
    """Get all space_after_comment violations from SwiftLint"""
    try:
        result = subprocess.run(['swiftlint', '--reporter', 'json'], 
                              capture_output=True, text=True, cwd='.')
        violations = json.loads(result.stdout)
        
        space_violations = [
            v for v in violations 
            if v.get('rule_id') == 'space_after_comment'
        ]
        
        return space_violations
    except Exception as e:
        print(f"Error getting violations: {e}")
        return []

def fix_file_comments(file_path):
    """Fix space after comment violations in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix //  patterns at start of line (header comments)
        content = re.sub(r'^([ \t]*//)\s\s+', r'\1 ', content, flags=re.MULTILINE)
        
        # Fix // followed by multiple spaces in general
        content = re.sub(r'//\s{2,}', '// ', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing space_after_comment violations...")
    
    violations = get_space_after_comment_violations()
    print(f"Found {len(violations)} space_after_comment violations")
    
    if not violations:
        print("No violations to fix")
        return
    
    # Group violations by file
    files_to_fix = {}
    for violation in violations:
        file_path = violation['file']
        if file_path not in files_to_fix:
            files_to_fix[file_path] = []
        files_to_fix[file_path].append(violation)
    
    print(f"Files to fix: {len(files_to_fix)}")
    
    fixed_files = 0
    for file_path in files_to_fix:
        if fix_file_comments(file_path):
            fixed_files += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_files} files")

if __name__ == "__main__":
    main()