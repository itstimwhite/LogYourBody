#!/usr/bin/env ruby

# This script temporarily disables the widget extension target
# to allow building without a widget provisioning profile

require 'xcodeproj'

project_path = ARGV[0] || 'apps/ios/LogYourBody.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the widget extension target
widget_target = project.targets.find { |t| t.name == 'LogYourBodyWidgetExtension' }

if widget_target
  puts "Found widget target: #{widget_target.name}"
  
  # Remove widget from main app's dependencies
  main_target = project.targets.find { |t| t.name == 'LogYourBody' }
  if main_target
    main_target.dependencies.delete_if { |d| d.target == widget_target }
    puts "Removed widget dependency from main app"
    
    # Remove from embed app extensions build phase
    embed_phase = main_target.build_phases.find { |p| p.is_a?(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase) && p.name == 'Embed Foundation Extensions' }
    if embed_phase
      embed_phase.files.delete_if { |f| f.display_name&.include?('LogYourBodyWidgetExtension') }
      puts "Removed widget from embed phase"
    end
  end
  
  # Remove the widget target itself
  project.targets.delete(widget_target)
  puts "Removed widget target"
  
  # Save the project
  project.save
  puts "Project saved successfully"
else
  puts "Widget target not found"
end