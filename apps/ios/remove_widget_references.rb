#!/usr/bin/env ruby

# This script removes widget references from the project file
# Run this before building in CI

project_file = '../LogYourBody.xcodeproj/project.pbxproj'
content = File.read(project_file)

puts "Removing widget references from project file..."

# Track what we're removing for debugging
removed_patterns = []

# Remove widget target references from dependencies
if content.gsub!(/.*LogYourBodyWidgetExtension.*dependency.*\n/, '')
  removed_patterns << "widget dependencies"
end

# Remove widget from embed extensions phase  
if content.gsub!(/.*LogYourBodyWidgetExtension.*in Embed.*\n/, '')
  removed_patterns << "embed extensions"
end

# Remove widget from target references (but not the target definition itself yet)
if content.gsub!(/.*LogYourBodyWidgetExtension.*,\s*\n/, '')
  removed_patterns << "target references"
end

# Write back
File.write(project_file, content)

if removed_patterns.empty?
  puts "No widget references found to remove"
else
  puts "Widget references removed: #{removed_patterns.join(', ')}"
end