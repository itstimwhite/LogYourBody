#!/usr/bin/env python3

import re
import os
import subprocess

def fix_file_headers(file_path):
    """Fix file header comment spacing to use single space"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        new_lines = []
        changed = False
        
        for i, line in enumerate(lines):
            # Fix file headers in first 10 lines
            if i < 10 and line.startswith('//  ') and (
                line.endswith('.swift') or 
                'LogYourBody' in line or 
                (i < 5 and line.strip() == '//')
            ):
                # Convert //  to //
                if line.strip() == '//':
                    new_lines.append('//')
                else:
                    content_part = line[3:].strip()  # Remove "//  "
                    if content_part:
                        new_lines.append(f'// {content_part}')
                    else:
                        new_lines.append('//')
                changed = True
            else:
                new_lines.append(line)
        
        if changed:
            new_content = '\n'.join(new_lines)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing file header comment spacing...")
    
    # Get all Swift files
    result = subprocess.run(['find', '.', '-name', '*.swift', '-not', '-path', './build/*'], 
                          capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error finding Swift files: {result.stderr}")
        return
    
    swift_files = [f.strip() for f in result.stdout.split('\n') if f.strip()]
    print(f"Found {len(swift_files)} Swift files")
    
    fixed_files = 0
    for file_path in swift_files:
        if fix_file_headers(file_path):
            fixed_files += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_files} files")

if __name__ == "__main__":
    main()