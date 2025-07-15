#!/usr/bin/env python3

import re
import os
import subprocess
import json

def get_button_violations():
    """Get files with Button trailing closure violations"""
    result = subprocess.run(['swiftlint', '--reporter', 'json'], capture_output=True, text=True)
    violations = json.loads(result.stdout)
    
    button_files = set()
    for v in violations:
        if v.get('rule_id') == 'multiple_closures_with_trailing_closure':
            button_files.add(v['file'])
    
    return button_files

def fix_button_syntax(content):
    """Fix Button(action: {...}) {...} to Button(action: {...}, label: {...})"""
    
    # Find all Button patterns
    button_start_pattern = r'Button\s*\(\s*action:\s*\{'
    
    pos = 0
    changes_made = False
    new_content = content
    
    while True:
        match = re.search(button_start_pattern, new_content[pos:])
        if not match:
            break
            
        start_pos = pos + match.start()
        action_start = pos + match.end() - 1  # Position of the opening brace
        
        # Find matching closing brace for action
        brace_count = 1
        action_end = action_start + 1
        
        while action_end < len(new_content) and brace_count > 0:
            if new_content[action_end] == '{':
                brace_count += 1
            elif new_content[action_end] == '}':
                brace_count -= 1
            action_end += 1
        
        if brace_count != 0:
            pos = action_end
            continue
            
        # Look for the closing ) and then trailing {
        paren_pos = action_end
        while paren_pos < len(new_content) and new_content[paren_pos].isspace():
            paren_pos += 1
            
        if paren_pos >= len(new_content) or new_content[paren_pos] != ')':
            pos = action_end
            continue
            
        # Look for opening brace of label
        label_start = paren_pos + 1
        while label_start < len(new_content) and new_content[label_start].isspace():
            label_start += 1
            
        if label_start >= len(new_content) or new_content[label_start] != '{':
            pos = action_end
            continue
            
        # Find matching closing brace for label
        brace_count = 1
        label_end = label_start + 1
        
        while label_end < len(new_content) and brace_count > 0:
            if new_content[label_end] == '{':
                brace_count += 1
            elif new_content[label_end] == '}':
                brace_count -= 1
            label_end += 1
            
        if brace_count != 0:
            pos = action_end
            continue
            
        # Extract the parts
        action_content = new_content[action_start:action_end]
        label_content = new_content[label_start:label_end]
        
        # Build replacement
        replacement = f'Button(\n            action: {action_content},\n            label: {label_content}\n        )'
        
        # Replace in content
        new_content = new_content[:start_pos] + replacement + new_content[label_end:]
        changes_made = True
        
        # Continue from after the replacement
        pos = start_pos + len(replacement)
        
    return new_content, changes_made

def fix_file(file_path):
    """Fix trailing closure violations in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, changed = fix_button_syntax(content)
        
        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing Button trailing closure violations...")
    
    files_to_fix = get_button_violations()
    print(f"Found {len(files_to_fix)} files with violations")
    
    fixed_count = 0
    for file_path in sorted(files_to_fix):
        if fix_file(file_path):
            fixed_count += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_count} files")

if __name__ == "__main__":
    main()