#!/usr/bin/env python3

import re
import os
import subprocess
import json

def get_file_header_violations():
    """Get all file_header violations from SwiftLint"""
    try:
        result = subprocess.run(['swiftlint', '--reporter', 'json'], 
                              capture_output=True, text=True, cwd='.')
        violations = json.loads(result.stdout)
        
        header_violations = [
            v for v in violations 
            if v.get('rule_id') == 'file_header'
        ]
        
        return header_violations
    except Exception as e:
        print(f"Error getting violations: {e}")
        return []

def fix_file_header(file_path):
    """Fix file header to match expected pattern"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Extract filename from path
        filename = os.path.basename(file_path)
        
        # Expected header pattern
        expected_header = f"""//
//  {filename}
//  LogYourBody
//
"""
        
        # Remove existing header and replace with correct one
        lines = content.split('\n')
        
        # Find where header ends (first non-comment line)
        header_end = 0
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped and not stripped.startswith('//') and not stripped.startswith('import'):
                header_end = i
                break
            elif stripped.startswith('import'):
                header_end = i
                break
        
        # If no proper header found, assume header ends at first import
        if header_end == 0:
            for i, line in enumerate(lines):
                if line.strip().startswith('import'):
                    header_end = i
                    break
        
        # Replace the header
        new_content = expected_header + '\n'.join(lines[header_end:])
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing file_header violations...")
    
    violations = get_file_header_violations()
    print(f"Found {len(violations)} file_header violations")
    
    if not violations:
        print("No violations to fix")
        return
    
    # Group violations by file
    files_to_fix = {}
    for violation in violations:
        file_path = violation['file']
        files_to_fix[file_path] = violation
    
    print(f"Files to fix: {len(files_to_fix)}")
    
    fixed_files = 0
    for file_path in files_to_fix:
        if fix_file_header(file_path):
            fixed_files += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_files} files")

if __name__ == "__main__":
    main()