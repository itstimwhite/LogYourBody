#!/usr/bin/env python3

import re
import os
import subprocess
import json

def fix_button_indentation(content):
    """Fix common Button indentation issues"""
    
    # Fix action: { with wrong indentation
    content = re.sub(
        r'(\s+)action: \{\n(\s*)([^\n]+)', 
        lambda m: f'{m.group(1)}action: {{\n{m.group(1)}    {m.group(3).strip()}',
        content
    )
    
    # Fix },\n            label: { patterns
    content = re.sub(
        r'(\s+)\},\n(\s*)label: \{\n(\s*)([^\n]+)',
        lambda m: f'{m.group(1)}}},\n{m.group(1)}label: {{\n{m.group(1)}    {m.group(4).strip()}',
        content
    )
    
    # Fix closing } indentation
    content = re.sub(
        r'\n(\s*)\}\n(\s*)\)',
        lambda m: f'\n{m.group(2)[:-4]}}}\n{m.group(2)})',
        content
    )
    
    return content

def get_files_with_button_indentation():
    """Get files with closure_end_indentation violations"""
    result = subprocess.run(['swiftlint', '--reporter', 'json'], capture_output=True, text=True)
    violations = json.loads(result.stdout)
    
    button_files = set()
    for v in violations:
        if v.get('rule_id') == 'closure_end_indentation':
            button_files.add(v['file'])
    
    return button_files

def fix_file(file_path):
    """Fix button indentation in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        new_content = fix_button_indentation(content)
        
        if new_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing Button indentation violations...")
    
    files_to_fix = get_files_with_button_indentation()
    print(f"Found {len(files_to_fix)} files with violations")
    
    fixed_count = 0
    for file_path in sorted(files_to_fix):
        if fix_file(file_path):
            fixed_count += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_count} files")

if __name__ == "__main__":
    main()