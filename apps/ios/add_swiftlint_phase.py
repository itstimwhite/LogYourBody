#!/usr/bin/env python3
"""
Add SwiftLint build phase to Xcode project
"""

import re
import sys
import os
from datetime import datetime

def find_target_section(content):
    """Find the PBXNativeTarget section for LogYourBody"""
    # Look for the native target section
    pattern = r'(\w+)\s+/\*\s+LogYourBody\s+\*/\s+=\s+{\s*isa\s+=\s+PBXNativeTarget'
    match = re.search(pattern, content)
    if match:
        return match.group(1)
    return None

def find_build_phases_section(content, target_id):
    """Find the buildPhases array for the target"""
    # Look for buildPhases in the target
    pattern = rf'{target_id}\s+/\*.*?\*/\s+=\s+{{[^}}]*?buildPhases\s+=\s+\(([^)]+)\)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1)
    return None

def generate_uuid():
    """Generate a 24-character UUID for Xcode"""
    import uuid
    return ''.join(str(uuid.uuid4()).upper().replace('-', '')[:24])

def add_swiftlint_phase(content):
    """Add SwiftLint build phase to the project"""
    
    # Check if SwiftLint phase already exists
    if "SwiftLint" in content and "shellScript" in content:
        print("SwiftLint build phase already exists")
        return content
    
    # Find the target ID
    target_id = find_target_section(content)
    if not target_id:
        print("Error: Could not find LogYourBody target")
        return None
    
    print(f"Found LogYourBody target: {target_id}")
    
    # Generate UUID for the new build phase
    phase_id = generate_uuid()
    print(f"Generated build phase ID: {phase_id}")
    
    # Create the shell script build phase
    shell_script = '''if [[ "$(uname -m)" == arm64 ]]; then
    export PATH="/opt/homebrew/bin:$PATH"
fi

if which swiftlint > /dev/null; then
    swiftlint
else
    echo "warning: SwiftLint not installed, download from https://github.com/realm/SwiftLint"
fi'''
    
    # Escape the shell script for the plist format
    escaped_script = shell_script.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    
    # Find the PBXShellScriptBuildPhase section
    shell_section_pattern = r'/\* Begin PBXShellScriptBuildPhase section \*/'
    shell_section_match = re.search(shell_section_pattern, content)
    
    if not shell_section_match:
        # Create the section if it doesn't exist
        resources_end = re.search(r'/\* End PBXResourcesBuildPhase section \*/', content)
        if resources_end:
            new_section = f'''\n/* Begin PBXShellScriptBuildPhase section */
		{phase_id} /* SwiftLint */ = {{
			isa = PBXShellScriptBuildPhase;
			alwaysOutOfDate = 1;
			buildActionMask = 2147483647;
			files = (
			);
			inputFileListPaths = (
			);
			inputPaths = (
			);
			name = SwiftLint;
			outputFileListPaths = (
			);
			outputPaths = (
			);
			runOnlyForDeploymentPostprocessing = 0;
			shellPath = /bin/sh;
			shellScript = "{escaped_script}";
		}};
/* End PBXShellScriptBuildPhase section */\n'''
            content = content[:resources_end.end()] + new_section + content[resources_end.end():]
    else:
        # Add to existing section
        section_end = re.search(r'/\* End PBXShellScriptBuildPhase section \*/', content)
        if section_end:
            new_phase = f'''		{phase_id} /* SwiftLint */ = {{
			isa = PBXShellScriptBuildPhase;
			alwaysOutOfDate = 1;
			buildActionMask = 2147483647;
			files = (
			);
			inputFileListPaths = (
			);
			inputPaths = (
			);
			name = SwiftLint;
			outputFileListPaths = (
			);
			outputPaths = (
			);
			runOnlyForDeploymentPostprocessing = 0;
			shellPath = /bin/sh;
			shellScript = "{escaped_script}";
		}};
'''
            insert_pos = section_end.start()
            content = content[:insert_pos] + new_phase + content[insert_pos:]
    
    # Now add the phase to the target's buildPhases array
    # Find the buildPhases array
    target_pattern = rf'({target_id}\s+/\*.*?\*/\s+=\s+{{[^}}]*?buildPhases\s+=\s+\()([^)]+)(\);)'
    target_match = re.search(target_pattern, content, re.DOTALL)
    
    if target_match:
        phases_start = target_match.group(1)
        phases_content = target_match.group(2)
        phases_end = target_match.group(3)
        
        # Add SwiftLint phase after Sources build phase
        sources_pattern = r'(\w+)\s+/\*\s+Sources\s+\*/'
        sources_match = re.search(sources_pattern, phases_content)
        
        if sources_match:
            # Insert after sources
            insert_point = sources_match.end()
            while insert_point < len(phases_content) and phases_content[insert_point] in [',', ' ', '\t', '\n']:
                insert_point += 1
            
            new_phases = phases_content[:insert_point] + f'\t\t\t\t{phase_id} /* SwiftLint */,\n\t\t\t\t' + phases_content[insert_point:]
        else:
            # Just add at the beginning
            new_phases = f'\n\t\t\t\t{phase_id} /* SwiftLint */,{phases_content}'
        
        # Replace the old buildPhases with the new one
        old_section = target_match.group(0)
        new_section = phases_start + new_phases + phases_end
        content = content.replace(old_section, new_section)
        
        print("Successfully added SwiftLint phase to buildPhases")
    else:
        print("Error: Could not find buildPhases array")
        return None
    
    return content

def main():
    project_file = "LogYourBody.xcodeproj/project.pbxproj"
    
    if not os.path.exists(project_file):
        print(f"Error: {project_file} not found!")
        return 1
    
    # Create backup
    backup_file = f"{project_file}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    with open(project_file, 'r') as f:
        content = f.read()
    
    with open(backup_file, 'w') as f:
        f.write(content)
    print(f"Created backup: {backup_file}")
    
    # Add SwiftLint phase
    new_content = add_swiftlint_phase(content)
    
    if new_content:
        with open(project_file, 'w') as f:
            f.write(new_content)
        print("Successfully updated project.pbxproj")
        print("\nNext steps:")
        print("1. Open the project in Xcode")
        print("2. Build the project to see SwiftLint in action")
        print("3. Install SwiftLint if not already installed: brew install swiftlint")
        return 0
    else:
        print("Failed to add SwiftLint build phase")
        return 1

if __name__ == "__main__":
    sys.exit(main())