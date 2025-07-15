#!/usr/bin/env python3

import re
import os
import subprocess
import json

def get_indentation_violations():
    """Get files with closure_end_indentation violations"""
    result = subprocess.run(['swiftlint', '--reporter', 'json'], capture_output=True, text=True)
    violations = json.loads(result.stdout)
    
    files_with_violations = set()
    for v in violations:
        if v.get('rule_id') == 'closure_end_indentation':
            files_with_violations.add(v['file'])
    
    return files_with_violations

def fix_closure_indentation(content):
    """Fix closure indentation in Button(action: {}, label: {}) patterns"""
    
    lines = content.split('\n')
    new_lines = []
    i = 0
    changed = False
    
    while i < len(lines):
        line = lines[i]
        
        # Look for Button( patterns
        if 'Button(' in line and 'action:' in line:
            # Check if this is our pattern
            if i + 1 < len(lines) and 'action: {' in lines[i + 1]:
                # Find the action and label blocks
                action_start = i + 1
                brace_count = 0
                action_end = action_start
                
                # Find the end of action closure
                for j in range(action_start, len(lines)):
                    if '{' in lines[j]:
                        brace_count += lines[j].count('{')
                    if '}' in lines[j]:
                        brace_count -= lines[j].count('}')
                        if brace_count == 0:
                            action_end = j
                            break
                
                # Find label start
                label_start = -1
                for j in range(action_end + 1, min(action_end + 3, len(lines))):
                    if 'label: {' in lines[j]:
                        label_start = j
                        break
                
                if label_start > 0:
                    # Find label end
                    brace_count = 0
                    label_end = label_start
                    for j in range(label_start, len(lines)):
                        if '{' in lines[j]:
                            brace_count += lines[j].count('{')
                        if '}' in lines[j]:
                            brace_count -= lines[j].count('}')
                            if brace_count == 0:
                                label_end = j
                                break
                    
                    # Fix indentation
                    new_lines.append(line)  # Button( line
                    
                    # Action closure
                    new_lines.append('            action: {')
                    for j in range(action_start + 1, action_end):
                        content_line = lines[j].lstrip()
                        if content_line:
                            new_lines.append('                ' + content_line)
                        else:
                            new_lines.append('')
                    new_lines.append('            },')
                    
                    # Label closure
                    new_lines.append('            label: {')
                    for j in range(label_start + 1, label_end):
                        content_line = lines[j].lstrip()
                        if content_line:
                            new_lines.append('                ' + content_line)
                        else:
                            new_lines.append('')
                    new_lines.append('            }')
                    
                    # Add closing line if exists
                    if label_end + 1 < len(lines) and lines[label_end + 1].strip() == ')':
                        new_lines.append('        )')
                        i = label_end + 2
                    else:
                        i = label_end + 1
                    
                    changed = True
                    continue
        
        new_lines.append(line)
        i += 1
    
    return '\n'.join(new_lines), changed

def fix_file(file_path):
    """Fix closure indentation violations in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, changed = fix_closure_indentation(content)
        
        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing closure indentation violations...")
    
    files_to_fix = get_indentation_violations()
    print(f"Found {len(files_to_fix)} files with indentation violations")
    
    fixed_count = 0
    for file_path in sorted(files_to_fix):
        if fix_file(file_path):
            fixed_count += 1
            print(f"Fixed: {file_path}")
    
    print(f"Fixed {fixed_count} files")

if __name__ == "__main__":
    main()