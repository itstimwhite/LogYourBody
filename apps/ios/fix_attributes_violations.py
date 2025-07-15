#!/usr/bin/env python3

import re
import subprocess
import json

def get_attribute_violations():
    """Get files with attribute violations"""
    result = subprocess.run(['swiftlint', '--reporter', 'json'], capture_output=True, text=True)
    violations = json.loads(result.stdout)
    
    files_with_violations = set()
    for v in violations:
        if v.get('rule_id') == 'attributes':
            files_with_violations.add(v['file'])
    
    return files_with_violations

def fix_attributes(content):
    """Fix attribute violations"""
    
    # Pattern for attributes with arguments that should be on their own line
    # @SomeAttribute(arg) var name
    pattern1 = r'(\s*)(@\w+\([^)]+\))\s+((?:var|let|func|class|struct|enum)\s+\w+)'
    content = re.sub(pattern1, r'\1\2\n\1\3', content)
    
    # Pattern for @StateObject, @EnvironmentObject etc on same line as variables
    pattern2 = r'(\s*)(@(?:StateObject|EnvironmentObject|Published|ObservedObject|AppStorage|State|Binding)\([^)]*\))\s+(var|let)\s+(\w+)'
    content = re.sub(pattern2, r'\1\2\n\1\3 \4', content)
    
    # Pattern for simple attributes on function/type declarations
    pattern3 = r'(\s*)(@\w+)\s+((?:func|class|struct|enum)\s+\w+)'
    content = re.sub(pattern3, r'\1\2\n\1\3', content)
    
    return content

def fix_file(file_path):
    """Fix attribute violations in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        new_content = fix_attributes(content)
        
        if new_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing attribute violations...")
    
    files_to_fix = get_attribute_violations()
    print(f"Found {len(files_to_fix)} files with attribute violations")
    
    fixed_count = 0
    for file_path in sorted(files_to_fix):
        if fix_file(file_path):
            fixed_count += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_count} files")

if __name__ == "__main__":
    main()