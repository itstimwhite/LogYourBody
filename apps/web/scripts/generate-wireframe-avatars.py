#!/usr/bin/env python3
"""Generate consistent wireframe avatars programmatically."""

import json
from pathlib import Path
from PIL import Image, ImageDraw
import math

def generate_wireframe_avatar(gender, body_fat, ffmi, output_path):
    """Generate a consistent wireframe torso avatar."""
    # Create a black image
    img_size = 512
    img = Image.new('RGB', (img_size, img_size), color='black')
    draw = ImageDraw.Draw(img)
    
    # Calculate proportions based on parameters
    # Base measurements
    center_x = img_size // 2
    torso_height = 320
    
    # FFMI affects overall width
    base_shoulder_width = 160
    shoulder_width = base_shoulder_width * (1 + (ffmi - 15) * 0.06)
    
    # Body fat affects waist taper and overall roundness
    waist_taper = 0.65 + (body_fat / 100) * 0.25  # Less taper with more body fat
    waist_width = shoulder_width * waist_taper
    
    # Gender affects shoulder-to-hip ratio
    if gender == 'female':
        shoulder_width *= 0.9
        waist_width *= 1.05
    
    # Define key points
    shoulder_y = 96
    chest_y = 180
    mid_torso_y = 260
    waist_y = shoulder_y + torso_height
    
    # Create curved sides based on body fat
    curve_factor = 0.1 + (body_fat / 100) * 0.15
    
    # Generate torso outline points
    points = []
    
    # Right side (top to bottom)
    for i in range(21):
        t = i / 20.0
        y = shoulder_y + t * torso_height
        
        # Calculate x position with curve
        if t < 0.3:  # Shoulder to chest
            progress = t / 0.3
            x = center_x + shoulder_width/2 - (shoulder_width - shoulder_width * 0.95) * progress * 0.5
        elif t < 0.7:  # Chest to mid-torso
            progress = (t - 0.3) / 0.4
            start_width = shoulder_width * 0.95
            end_width = shoulder_width * (0.85 - curve_factor)
            x = center_x + (start_width + (end_width - start_width) * progress) / 2
        else:  # Mid-torso to waist
            progress = (t - 0.7) / 0.3
            start_width = shoulder_width * (0.85 - curve_factor)
            x = center_x + (start_width + (waist_width - start_width) * progress) / 2
        
        points.append((x, y))
    
    # Left side (bottom to top)
    for i in range(20, -1, -1):
        t = i / 20.0
        y = shoulder_y + t * torso_height
        
        # Mirror x position
        if t < 0.3:
            progress = t / 0.3
            x = center_x - shoulder_width/2 + (shoulder_width - shoulder_width * 0.95) * progress * 0.5
        elif t < 0.7:
            progress = (t - 0.3) / 0.4
            start_width = shoulder_width * 0.95
            end_width = shoulder_width * (0.85 - curve_factor)
            x = center_x - (start_width + (end_width - start_width) * progress) / 2
        else:
            progress = (t - 0.7) / 0.3
            start_width = shoulder_width * (0.85 - curve_factor)
            x = center_x - (start_width + (waist_width - start_width) * progress) / 2
        
        points.append((x, y))
    
    # Draw the outline
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill='white', width=2)
    draw.line([points[-1], points[0]], fill='white', width=2)
    
    # Add internal wireframe grid
    # Horizontal lines
    grid_spacing = 30
    for y in range(shoulder_y + grid_spacing, waist_y, grid_spacing):
        # Find intersection points with outline
        left_x = None
        right_x = None
        
        for i in range(len(points) - 1):
            p1, p2 = points[i], points[i + 1]
            if p1[1] <= y <= p2[1] or p2[1] <= y <= p1[1]:
                # Linear interpolation
                if p2[1] != p1[1]:
                    t = (y - p1[1]) / (p2[1] - p1[1])
                    x = p1[0] + t * (p2[0] - p1[0])
                    
                    if x < center_x and (left_x is None or x < left_x):
                        left_x = x
                    elif x > center_x and (right_x is None or x > right_x):
                        right_x = x
        
        if left_x and right_x:
            draw.line([(left_x + 2, y), (right_x - 2, y)], fill='white', width=1)
    
    # Vertical center line
    draw.line([(center_x, shoulder_y + 10), (center_x, waist_y - 10)], fill='white', width=1)
    
    # Add muscle definition lines based on body fat
    if body_fat <= 20:
        # Add vertical lines for abs
        ab_width = 30
        for x_offset in [-ab_width, ab_width]:
            draw.line([
                (center_x + x_offset, chest_y + 40),
                (center_x + x_offset, waist_y - 40)
            ], fill='white', width=1)
    
    # Add diagonal lines for more geometric look
    if body_fat <= 15:
        # Upper diagonal lines
        draw.line([
            (center_x - shoulder_width * 0.4, shoulder_y + 40),
            (center_x - 20, chest_y)
        ], fill='white', width=1)
        draw.line([
            (center_x + shoulder_width * 0.4, shoulder_y + 40),
            (center_x + 20, chest_y)
        ], fill='white', width=1)
    
    # Save the image
    img.save(output_path, 'PNG')
    return True

def main():
    # Load specifications
    specs_path = Path(__file__).parent.parent / "public" / "avatars-new" / "generation-specs.json"
    with open(specs_path, 'r') as f:
        specs = json.load(f)
    
    print(f"Generating {len(specs)} consistent wireframe avatars...")
    
    # Create directories
    for spec in specs:
        Path(spec['path']).parent.mkdir(parents=True, exist_ok=True)
    
    # Generate avatars
    successful = 0
    for i, spec in enumerate(specs):
        if i % 10 == 0:
            print(f"Progress: {i}/{len(specs)}")
        
        if generate_wireframe_avatar(
            spec['gender'], 
            spec['bodyFat'], 
            spec['ffmi'], 
            spec['path']
        ):
            successful += 1
    
    print(f"\nGenerated {successful} wireframe avatars!")
    
    # Update manifest
    manifest = {
        "version": "2.0",
        "type": "programmatic-wireframe",
        "avatars": {}
    }
    
    for spec in specs:
        gender = spec['gender']
        if gender not in manifest['avatars']:
            manifest['avatars'][gender] = {}
        
        ffmi_key = f"ffmi_{spec['ffmi']}"
        if ffmi_key not in manifest['avatars'][gender]:
            manifest['avatars'][gender][ffmi_key] = {}
        
        bf_key = f"bf_{spec['bodyFat']}"
        manifest['avatars'][gender][ffmi_key][bf_key] = spec['filename']
    
    manifest_path = Path(__file__).parent.parent / "public" / "avatars-new" / "avatar-manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"Manifest saved to: {manifest_path}")

if __name__ == "__main__":
    main()