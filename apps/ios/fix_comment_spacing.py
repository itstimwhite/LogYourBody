#!/usr/bin/env python3

import re
import os
import subprocess
import json

def fix_comment_spacing_in_file(file_path):
    """Fix comment spacing violations in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix file headers - they should use //  format for filename lines
        # but only for the filename line specifically
        lines = content.split('\n')
        new_lines = []
        
        for i, line in enumerate(lines):
            # File header pattern: if it's a filename line (contains .swift)
            if i < 10 and '.swift' in line and line.strip().startswith('//'):
                # This should be //  filename.swift
                if line.startswith('//') and not line.startswith('//  '):
                    filename_part = line[2:].strip()
                    new_lines.append(f'//  {filename_part}')
                else:
                    new_lines.append(line)
            # Project name line after filename
            elif i < 10 and 'LogYourBody' in line and line.strip().startswith('//') and not any(word in line.lower() for word in ['import', 'struct', 'class', 'func', 'var', 'let']):
                if line.startswith('//') and not line.startswith('//  '):
                    project_part = line[2:].strip()
                    new_lines.append(f'//  {project_part}')
                else:
                    new_lines.append(line)
            # All other comments should be // (single space)
            elif line.strip().startswith('//') and not line.strip().startswith('///'):
                if line.startswith('//  ') and not ('.swift' in line or 'LogYourBody' in line):
                    # Convert //  to // for non-header comments
                    content_part = line[3:].strip()
                    if content_part:
                        new_lines.append(f'// {content_part}')
                    else:
                        new_lines.append('//')
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        
        new_content = '\n'.join(new_lines)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing comment spacing violations...")
    
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
        if fix_comment_spacing_in_file(file_path):
            fixed_files += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_files} files")

if __name__ == "__main__":
    main()