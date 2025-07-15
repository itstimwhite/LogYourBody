#!/usr/bin/env python3
import re
import subprocess

def get_attribute_violations():
    """Get all attribute violations from SwiftLint"""
    result = subprocess.run(['swiftlint'], capture_output=True, text=True)
    violations = []
    
    # SwiftLint outputs to both stdout and stderr, check both
    output = result.stdout + result.stderr
    
    for line in output.split('\n'):
        if 'Attributes Violation' in line:
            # Parse the violation line
            match = re.match(r'([^:]+):(\d+):(\d+): warning: (.+)', line)
            if match:
                file_path, line_num, col_num, message = match.groups()
                violations.append({
                    'file': file_path,
                    'line': int(line_num),
                    'column': int(col_num),
                    'message': message
                })
    
    return violations

def fix_environment_attributes(file_path, line_num):
    """Fix @Environment attributes that need to be on separate lines"""
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    if line_num <= len(lines):
        line = lines[line_num - 1]
        # Check if this is an @Environment attribute
        if '@Environment(' in line and 'var ' in line:
            # Split the line at the @Environment attribute
            parts = line.split('@Environment(')
            if len(parts) == 2:
                prefix = parts[0]
                rest = '@Environment(' + parts[1]
                
                # Find where the attribute ends and the var starts
                paren_count = 1
                i = len('@Environment(')
                while i < len(rest) and paren_count > 0:
                    if rest[i] == '(':
                        paren_count += 1
                    elif rest[i] == ')':
                        paren_count -= 1
                    i += 1
                
                if paren_count == 0:
                    attribute_part = rest[:i]
                    var_part = rest[i:].strip()
                    
                    # Create new lines
                    lines[line_num - 1] = prefix + attribute_part + '\n'
                    if var_part:
                        lines.insert(line_num, prefix + var_part)
                    
                    # Write back
                    with open(file_path, 'w') as f:
                        f.writelines(lines)
                    
                    return True
    
    return False

def fix_viewbuilder_attributes(file_path, line_num):
    """Fix @ViewBuilder attributes that need to be on same line as variables"""
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    if line_num <= len(lines) and line_num < len(lines):
        current_line = lines[line_num - 1].strip()
        next_line = lines[line_num].strip() if line_num < len(lines) else ""
        
        # Check if this is @ViewBuilder on its own line followed by a var
        if current_line == '@ViewBuilder' and next_line.startswith('private var'):
            # Combine the lines
            indent = ' ' * (len(lines[line_num - 1]) - len(lines[line_num - 1].lstrip()))
            lines[line_num - 1] = indent + '@ViewBuilder ' + next_line + '\n'
            del lines[line_num]
            
            # Write back
            with open(file_path, 'w') as f:
                f.writelines(lines)
            
            return True
    
    return False

def main():
    violations = get_attribute_violations()
    print(f"Found {len(violations)} attribute violations")
    
    fixed_count = 0
    
    for violation in violations:
        file_path = violation['file']
        line_num = violation['line']
        message = violation['message']
        
        print(f"Fixing {file_path}:{line_num} - {message}")
        
        if 'arguments or inside always_on_line_above' in message:
            if fix_environment_attributes(file_path, line_num):
                fixed_count += 1
        elif 'should be on their own lines in functions and types' in message:
            if fix_viewbuilder_attributes(file_path, line_num):
                fixed_count += 1
    
    print(f"Fixed {fixed_count} violations")

if __name__ == '__main__':
    main()