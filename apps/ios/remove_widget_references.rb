#!/usr/bin/env ruby

# This script removes widget references from the project file
# Run this before building in CI

project_file = '../LogYourBody.xcodeproj/project.pbxproj'
content = File.read(project_file)

puts "Removing widget references from project file..."

# Count removals for debugging
removals = 0

# Remove widget target references from dependencies
removals += content.gsub!(/.*LogYourBodyWidgetExtension.*dependency.*\n/, '').to_s.scan(//).length

# Remove widget from embed extensions phase
removals += content.gsub!(/.*LogYourBodyWidgetExtension.*in Embed.*\n/, '').to_s.scan(//).length

# Remove widget target definition
removals += content.gsub!(/.*LogYourBodyWidgetExtension.*isa = PBXNativeTarget.*\n/, '').to_s.scan(//).length

# Remove any line containing LogYourBodyWidget
removals += content.gsub!(/.*LogYourBodyWidget.*\n/, '').to_s.scan(//).length

# Remove widget build configurations
removals += content.gsub!(/.*LogYourBodyWidgetExtension.*buildConfigurationList.*\n/, '').to_s.scan(//).length

# Remove widget from target list
removals += content.gsub!(/.*LogYourBodyWidgetExtension.*,\s*\n/, '').to_s.scan(//).length

# Write back
File.write(project_file, content)

puts "Widget references removed from project file (#{removals} lines removed)"