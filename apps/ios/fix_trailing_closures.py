#!/usr/bin/env python3

import re
import os
import subprocess
import json

def get_trailing_closure_violations():
    """Get all multiple_closures_with_trailing_closure violations from SwiftLint"""
    try:
        result = subprocess.run(['swiftlint', '--reporter', 'json'], 
                              capture_output=True, text=True, cwd='.')
        violations = json.loads(result.stdout)
        
        closure_violations = [
            v for v in violations 
            if v.get('rule_id') == 'multiple_closures_with_trailing_closure'
        ]
        
        return closure_violations
    except Exception as e:
        print(f"Error getting violations: {e}")
        return []

def fix_trailing_closures_in_file(file_path):
    """Fix trailing closure violations in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern 1: Button(action: {...}) { ... }
        # Convert to: Button(action: {...}, label: { ... })
        button_pattern = r'Button\(\s*action:\s*\{\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\s*\}\s*\)\s*\{\s*'
        matches = list(re.finditer(button_pattern, content, re.DOTALL))
        
        # Process matches from end to beginning to preserve positions
        for match in reversed(matches):
            start = match.start()
            # Find the matching closing brace for the label
            brace_count = 0
            pos = match.end()
            
            while pos < len(content):
                if content[pos] == '{':
                    brace_count += 1
                elif content[pos] == '}':
                    if brace_count == 0:
                        # Found the closing brace
                        action_content = match.group(1)
                        label_start = match.end()
                        label_content = content[label_start:pos]
                        
                        # Clean up action content
                        action_content = action_content.strip()
                        
                        # Build the replacement
                        replacement = f'Button(\n            action: {{\n                {action_content}\n            }},\n            label: {{\n{label_content}\n            }}\n        )'
                        
                        # Replace in content
                        content = content[:start] + replacement + content[pos+1:]
                        break
                    else:
                        brace_count -= 1
                pos += 1
        
        # Pattern 2: Other trailing closure patterns (Alert, NavigationLink, etc.)
        # More specific patterns for common SwiftUI components
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    print("Fixing multiple_closures_with_trailing_closure violations...")
    
    violations = get_trailing_closure_violations()
    print(f"Found {len(violations)} trailing closure violations")
    
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
    
    # Print some details for manual review
    for file_path, viols in list(files_to_fix.items())[:5]:  # Show first 5 files
        print(f"\n{file_path}: {len(viols)} violations")
        for v in viols[:2]:  # Show first 2 violations per file
            print(f"  Line {v.get('line', 'N/A')}: {v.get('reason', 'N/A')}")

if __name__ == "__main__":
    main()