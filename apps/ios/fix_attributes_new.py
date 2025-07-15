#!/usr/bin/env python3

import re
import os
import subprocess
import json

def get_attribute_violations():
    """Get all attributes violations from SwiftLint"""
    try:
        result = subprocess.run(['swiftlint', '--reporter', 'json'], 
                              capture_output=True, text=True, cwd='.')
        violations = json.loads(result.stdout)
        
        attribute_violations = [
            v for v in violations 
            if v.get('rule_id') == 'attributes'
        ]
        
        return attribute_violations
    except Exception as e:
        print(f"Error getting violations: {e}")
        return []

def fix_attributes_in_file(file_path):
    """Fix attribute positioning violations in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern 1: @ViewBuilder on same line as function/var - move to separate line
        content = re.sub(
            r'^(\s*)@ViewBuilder\s+(private\s+var\s+\w+.*?)$',
            r'\1@ViewBuilder\n\1\2',
            content,
            flags=re.MULTILINE
        )
        
        content = re.sub(
            r'^(\s*)@ViewBuilder\s+(var\s+\w+.*?)$',
            r'\1@ViewBuilder\n\1\2',
            content,
            flags=re.MULTILINE
        )
        
        # Pattern 2: @Environment attributes with trailing whitespace
        content = re.sub(
            r'^(\s*)@Environment\([^)]+\)\s+$',
            r'\1@Environment(\\.isEnabled)',
            content,
            flags=re.MULTILINE
        )
        
        # Pattern 3: Other attributes like @State, @Binding, etc. on functions
        common_attributes = ['State', 'Binding', 'ObservedObject', 'StateObject', 'EnvironmentObject', 'Environment', 'FocusState']
        
        for attr in common_attributes:
            # Move attribute to separate line for function declarations
            pattern = f'^(\\s*)@{attr}\\([^)]*\\)\\s+(func\\s+\\w+.*?)$'
            replacement = f'\\1@{attr}(\\n\\1\\2'
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
            
            # Handle simple attributes without parameters
            pattern = f'^(\\s*)@{attr}\\s+(func\\s+\\w+.*?)$'
            replacement = f'\\1@{attr}\\n\\1\\2'
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing attributes violations...")
    
    violations = get_attribute_violations()
    print(f"Found {len(violations)} attributes violations")
    
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
        if fix_attributes_in_file(file_path):
            fixed_files += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_files} files")

    # Show first few violations for reference
    print("\nFirst few violations:")
    for i, violation in enumerate(violations[:5]):
        print(f"{i+1}. {violation['file']}:{violation.get('line', 'N/A')} - {violation.get('reason', 'N/A')}")

if __name__ == "__main__":
    main()