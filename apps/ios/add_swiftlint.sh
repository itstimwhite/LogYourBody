#!/bin/bash

# Script to add SwiftLint build phase to Xcode project
# This script modifies the project.pbxproj file to add a SwiftLint run script phase

PROJECT_FILE="LogYourBody.xcodeproj/project.pbxproj"

# Check if project file exists
if [ ! -f "$PROJECT_FILE" ]; then
    echo "Error: project.pbxproj not found!"
    exit 1
fi

# Create backup
cp "$PROJECT_FILE" "$PROJECT_FILE.backup_swiftlint"

# SwiftLint script content
SWIFTLINT_SCRIPT='if [[ "$(uname -m)" == arm64 ]]; then
    export PATH="/opt/homebrew/bin:$PATH"
fi

if which swiftlint > /dev/null; then
    swiftlint
else
    echo "warning: SwiftLint not installed, download from https://github.com/realm/SwiftLint"
fi'

# Create a Python script to modify the project file
cat > add_swiftlint_phase.py << 'EOF'
import re
import sys

def add_swiftlint_phase(content):
    # Find the PBXNativeTarget section for LogYourBody
    target_pattern = r'(AD723AF42E15FA5C002376C6 /\* LogYourBody \*/ = \{[^}]+buildPhases = \([^)]+)'
    target_match = re.search(target_pattern, content, re.DOTALL)
    
    if not target_match:
        print("Error: Could not find LogYourBody target")
        return None
    
    # Check if SwiftLint phase already exists
    if "SwiftLint" in content:
        print("SwiftLint build phase already exists")
        return content
    
    # Generate new UUIDs for the build phase
    import uuid
    phase_id = ''.join(str(uuid.uuid4()).upper().replace('-', '')[:24])
    
    # Add the SwiftLint build phase to PBXShellScriptBuildPhase section
    shell_script_section = re.search(r'(/\* End PBXResourcesBuildPhase section \*/\n)', content)
    if shell_script_section:
        swiftlint_phase = f'''

/* Begin PBXShellScriptBuildPhase section */
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
			shellScript = "if [[ \\"$(uname -m)\\" == arm64 ]]; then\\n    export PATH=\\"/opt/homebrew/bin:$PATH\\"\\nfi\\n\\nif which swiftlint > /dev/null; then\\n    swiftlint\\nelse\\n    echo \\"warning: SwiftLint not installed, download from https://github.com/realm/SwiftLint\\"\\nfi\\n";
		}};
/* End PBXShellScriptBuildPhase section */'''
        
        content = content.replace(shell_script_section.group(1), shell_script_section.group(1) + swiftlint_phase)
    
    # Add the phase ID to the buildPhases array
    build_phases_match = re.search(r'(buildPhases = \([^)]+)(\);)', target_match.group(0), re.DOTALL)
    if build_phases_match:
        # Add SwiftLint phase before the last phase (usually resources)
        phases = build_phases_match.group(1)
        new_phases = phases + f',\n\t\t\t\t{phase_id} /* SwiftLint */,'
        updated_target = target_match.group(0).replace(build_phases_match.group(0), new_phases + build_phases_match.group(2))
        content = content.replace(target_match.group(0), updated_target)
    
    return content

# Read the project file
with open(sys.argv[1], 'r') as f:
    content = f.read()

# Add SwiftLint phase
new_content = add_swiftlint_phase(content)

if new_content:
    # Write the updated content
    with open(sys.argv[1], 'w') as f:
        f.write(new_content)
    print("Successfully added SwiftLint build phase")
else:
    print("Failed to add SwiftLint build phase")
    sys.exit(1)
EOF

# Run the Python script
python3 add_swiftlint_phase.py "$PROJECT_FILE"

# Clean up
rm add_swiftlint_phase.py

echo "SwiftLint build phase has been added to the Xcode project."
echo "Make sure to install SwiftLint using: brew install swiftlint"