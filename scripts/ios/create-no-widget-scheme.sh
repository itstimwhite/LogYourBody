#!/bin/bash

# This script creates a modified build configuration that excludes the widget extension

echo "Creating no-widget build configuration for iOS"
echo "============================================="

cd apps/ios

# Create a backup of the current project file
cp LogYourBody.xcodeproj/project.pbxproj LogYourBody.xcodeproj/project.pbxproj.backup_widget

echo ""
echo "IMPORTANT: Manual steps required:"
echo "================================="
echo ""
echo "Since the xcodeproj gem is incompatible with the latest Xcode project format,"
echo "we need to use a different approach in the Fastfile:"
echo ""
echo "1. The Fastfile has been updated to exclude the widget from provisioning profiles"
echo ""
echo "2. To fully exclude the widget from the build, you can:"
echo "   a) Create a new scheme in Xcode that doesn't include the widget target"
echo "   b) Or manually remove the widget files from the project"
echo ""
echo "3. For CI/CD, we'll try using automatic signing for now"
echo ""

# Let's try a different approach - create a pre-build script that removes widget references
cat > remove_widget_references.rb << 'EOF'
#!/usr/bin/env ruby

# This script removes widget references from the project file
# Run this before building in CI

project_file = 'LogYourBody.xcodeproj/project.pbxproj'
content = File.read(project_file)

# Remove widget target references from dependencies
content.gsub!(/.*LogYourBodyWidgetExtension.*dependency.*\n/, '')

# Remove widget from embed extensions phase
content.gsub!(/.*LogYourBodyWidgetExtension.*in Embed.*\n/, '')

# Write back
File.write(project_file, content)

puts "Widget references removed from project file"
EOF

chmod +x remove_widget_references.rb

echo ""
echo "Created remove_widget_references.rb script"
echo "This can be run in CI before building to remove widget dependencies"