#!/usr/bin/env python3
import re
import sys

def fix_xcode_duplicates():
    # Read the project file
    with open('LogYourBody.xcodeproj/project.pbxproj', 'r') as f:
        content = f.read()

    lines = content.split('\n')
    
    # Track file references and their build file entries
    file_refs_to_build_files = {}
    build_file_sections = {}
    
    # First pass: collect all build file sections
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if re.match(r'^[0-9A-F]+ /\* .+ \*/ = {$', line):
            # This is a build file entry
            build_file_id = line.split()[0]
            section_start = i
            
            # Find the end of this section
            section_end = i
            brace_count = 1
            i += 1
            while i < len(lines) and brace_count > 0:
                if '{' in lines[i]:
                    brace_count += lines[i].count('{')
                if '}' in lines[i]:
                    brace_count -= lines[i].count('}')
                section_end = i
                i += 1
            
            # Extract the section
            section = lines[section_start:section_end + 1]
            
            # Look for fileRef in this section
            file_ref = None
            for section_line in section:
                match = re.search(r'fileRef = ([0-9A-F]+)', section_line)
                if match:
                    file_ref = match.group(1)
                    break
            
            if file_ref:
                if file_ref not in file_refs_to_build_files:
                    file_refs_to_build_files[file_ref] = []
                file_refs_to_build_files[file_ref].append((build_file_id, section_start, section_end))
                build_file_sections[build_file_id] = (section_start, section_end)
        else:
            i += 1
    
    # Identify duplicates and mark them for removal
    sections_to_remove = set()
    build_files_to_remove = set()
    
    for file_ref, build_files in file_refs_to_build_files.items():
        if len(build_files) > 1:
            # Keep the first one, remove the rest
            for build_file_id, start, end in build_files[1:]:
                sections_to_remove.add((start, end))
                build_files_to_remove.add(build_file_id)
                print(f"Marking duplicate build file {build_file_id} for file ref {file_ref}")
    
    # Remove the duplicate sections
    new_lines = []
    i = 0
    while i < len(lines):
        should_skip = False
        for start, end in sections_to_remove:
            if start <= i <= end:
                should_skip = True
                break
        
        if not should_skip:
            new_lines.append(lines[i])
        i += 1
    
    # Now remove references to the deleted build files from build phases
    final_lines = []
    for line in new_lines:
        should_include = True
        for build_file_id in build_files_to_remove:
            if build_file_id in line and 'isa = PBX' not in line:
                # This line references a build file we removed
                should_include = False
                break
        
        if should_include:
            final_lines.append(line)
    
    # Write back
    with open('LogYourBody.xcodeproj/project.pbxproj', 'w') as f:
        f.write('\n'.join(final_lines))
    
    print(f"Removed {len(sections_to_remove)} duplicate build file sections")
    print(f"Cleaned {len(build_files_to_remove)} build file references from build phases")

if __name__ == '__main__':
    fix_xcode_duplicates()