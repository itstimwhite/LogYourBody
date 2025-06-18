#!/usr/bin/env python3
"""Generate placeholder avatars for development."""

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random

def generate_placeholder_avatar(gender, body_fat, ffmi, output_path):
    """Generate a simple placeholder avatar."""
    # Create a black image
    img = Image.new('RGB', (512, 512), color='black')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple wireframe torso
    width, height = 512, 512
    center_x = width // 2
    
    # Calculate body width based on FFMI and body fat
    base_width = 120 + (ffmi - 15) * 10
    fat_modifier = 1 + (body_fat - 20) * 0.01
    torso_width = int(base_width * fat_modifier)
    
    # Draw torso outline
    # Shoulders
    shoulder_y = 100
    shoulder_width = torso_width + 40
    draw.line([(center_x - shoulder_width//2, shoulder_y), 
               (center_x + shoulder_width//2, shoulder_y)], fill='white', width=2)
    
    # Chest
    chest_y = 180
    chest_width = torso_width + 20
    draw.line([(center_x - shoulder_width//2, shoulder_y), 
               (center_x - chest_width//2, chest_y)], fill='white', width=2)
    draw.line([(center_x + shoulder_width//2, shoulder_y), 
               (center_x + chest_width//2, chest_y)], fill='white', width=2)
    
    # Waist
    waist_y = 350
    waist_width = torso_width - 20
    draw.line([(center_x - chest_width//2, chest_y), 
               (center_x - waist_width//2, waist_y)], fill='white', width=2)
    draw.line([(center_x + chest_width//2, chest_y), 
               (center_x + waist_width//2, waist_y)], fill='white', width=2)
    draw.line([(center_x - waist_width//2, waist_y), 
               (center_x + waist_width//2, waist_y)], fill='white', width=2)
    
    # Add some muscle definition lines based on body fat
    if body_fat <= 15:
        # Abs
        for i in range(3):
            y = chest_y + 40 + i * 40
            draw.line([(center_x - waist_width//3, y), 
                      (center_x + waist_width//3, y)], fill='white', width=1)
        # Center line
        draw.line([(center_x, chest_y), (center_x, waist_y)], fill='white', width=1)
    
    if body_fat <= 20:
        # Pecs
        draw.arc([(center_x - chest_width//3, chest_y - 30), 
                  (center_x - 10, chest_y + 30)], 0, 180, fill='white', width=1)
        draw.arc([(center_x + 10, chest_y - 30), 
                  (center_x + chest_width//3, chest_y + 30)], 0, 180, fill='white', width=1)
    
    # Add labels for development
    try:
        # Try to use default font, fall back to basic if not available
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
    except:
        font = ImageFont.load_default()
    
    label = f"{gender[0].upper()} BF:{body_fat}% FFMI:{ffmi}"
    draw.text((10, 10), label, fill='gray', font=font)
    
    # Save the image
    img.save(output_path, 'PNG')
    return True

def main():
    # Load specifications
    specs_path = Path(__file__).parent.parent / "public" / "avatars-new" / "generation-specs.json"
    with open(specs_path, 'r') as f:
        specs = json.load(f)
    
    print(f"Generating {len(specs)} placeholder avatars...")
    
    # Create directories
    for spec in specs:
        Path(spec['path']).parent.mkdir(parents=True, exist_ok=True)
    
    # Generate placeholders
    successful = 0
    for i, spec in enumerate(specs):
        if i % 10 == 0:
            print(f"Progress: {i}/{len(specs)}")
        
        if generate_placeholder_avatar(
            spec['gender'], 
            spec['bodyFat'], 
            spec['ffmi'], 
            spec['path']
        ):
            successful += 1
    
    print(f"\nGenerated {successful} placeholder avatars!")
    
    # Update manifest
    manifest = {
        "version": "2.0-placeholder",
        "type": "placeholder",
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