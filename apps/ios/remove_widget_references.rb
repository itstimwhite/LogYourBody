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