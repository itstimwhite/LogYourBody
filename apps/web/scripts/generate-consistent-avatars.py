#!/usr/bin/env python3
"""Generate consistent avatars using a seed image approach."""

import os
import json
import time
import requests
from pathlib import Path
from PIL import Image, ImageDraw
from io import BytesIO
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def create_base_wireframe_programmatically():
    """Create a base wireframe torso programmatically for consistency."""
    # Create a 512x512 black image
    img = Image.new('RGB', (512, 512), color='black')
    draw = ImageDraw.Draw(img)
    
    # Define base torso shape points
    width, height = 512, 512
    center_x = width // 2
    
    # Basic torso wireframe
    # Shoulders
    shoulder_y = 100
    shoulder_width = 180
    
    # Chest  
    chest_y = 180
    chest_width = 160
    
    # Waist
    waist_y = 380
    waist_width = 120
    
    # Draw the wireframe outline
    points = [
        (center_x - shoulder_width//2, shoulder_y),  # Left shoulder
        (center_x + shoulder_width//2, shoulder_y),  # Right shoulder
        (center_x + chest_width//2, chest_y),       # Right chest
        (center_x + waist_width//2, waist_y),       # Right waist
        (center_x - waist_width//2, waist_y),       # Left waist
        (center_x - chest_width//2, chest_y),       # Left chest
        (center_x - shoulder_width//2, shoulder_y)   # Back to start
    ]
    
    # Draw outline
    for i in range(len(points)-1):
        draw.line([points[i], points[i+1]], fill='white', width=2)
    
    # Add grid pattern
    # Horizontal lines
    for y in range(shoulder_y, waist_y, 30):
        left_x = center_x - (shoulder_width - (y - shoulder_y) * 0.3) // 2
        right_x = center_x + (shoulder_width - (y - shoulder_y) * 0.3) // 2
        draw.line([(left_x, y), (right_x, y)], fill='white', width=1)
    
    # Vertical center line
    draw.line([(center_x, shoulder_y), (center_x, waist_y)], fill='white', width=1)
    
    # Save base template
    img.save('base_wireframe_template.png')
    return img

def generate_avatar_batch():
    """Generate avatars using a consistent approach."""
    
    # First create a base template
    print("Creating base wireframe template...")
    base_template = create_base_wireframe_programmatically()
    
    # Load specifications
    specs_path = Path(__file__).parent.parent / "public" / "avatars-new" / "generation-specs.json"
    with open(specs_path, 'r') as f:
        all_specs = json.load(f)
    
    # Group by gender and FFMI to generate similar ones together
    specs_by_group = {}
    for spec in all_specs:
        group_key = f"{spec['gender']}_{spec['ffmi']}"
        if group_key not in specs_by_group:
            specs_by_group[group_key] = []
        specs_by_group[group_key].append(spec)
    
    # Generate each group
    for group_key, specs in specs_by_group.items():
        gender, ffmi = group_key.split('_')
        ffmi = float(ffmi)
        
        print(f"\nGenerating {len(specs)} avatars for {gender} FFMI {ffmi}")
        
        # Use a very specific prompt for this group
        base_prompt = f"""Create a set of {len(specs)} technical wireframe torso diagrams for a fitness app. 

ESSENTIAL REQUIREMENTS:
1. Each image shows ONLY a torso outline (no head, no full arms, no legs)
2. Simple white line drawing on pure black background
3. Geometric wireframe grid pattern inside the torso shape
4. All {len(specs)} images must use the EXACT same pose and style
5. Only vary the torso width/shape based on body composition

SPECIFIC PARAMETERS:
- Gender: {gender} anatomy
- FFMI: {ffmi} (muscle mass level)
- Create {len(specs)} variations with body fat percentages: {', '.join([str(s['bodyFat']) + '%' for s in specs])}
- Lower body fat = more angular/defined shape
- Higher body fat = rounder/softer shape

STYLE REFERENCE: Technical fitness app icons, like MyFitnessPal body type selectors"""

        # Generate in small batches
        batch_size = 5
        for i in range(0, len(specs), batch_size):
            batch = specs[i:i+batch_size]
            
            for spec in batch:
                print(f"  Generating {spec['filename']}...")
                
                specific_prompt = f"""{base_prompt}

This specific image: {spec['gender']} torso with {spec['bodyFat']}% body fat and FFMI {spec['ffmi']}"""
                
                try:
                    response = client.images.generate(
                        model="dall-e-3",
                        prompt=specific_prompt,
                        size="1024x1024",
                        quality="standard",
                        n=1
                    )
                    
                    # Download and save
                    img_url = response.data[0].url
                    img_response = requests.get(img_url)
                    if img_response.status_code == 200:
                        img = Image.open(BytesIO(img_response.content))
                        
                        # Post-process for consistency
                        img = img.resize((512, 512), Image.Resampling.LANCZOS)
                        
                        # Ensure directories exist
                        Path(spec['path']).parent.mkdir(parents=True, exist_ok=True)
                        
                        # Save
                        img.save(spec['path'], 'PNG')
                        print(f"    ✓ Saved: {spec['path']}")
                    
                    # Rate limit
                    time.sleep(1)
                    
                except Exception as e:
                    print(f"    ✗ Error: {e}")
            
            # Longer pause between batches
            if i + batch_size < len(specs):
                print("  Pausing between batches...")
                time.sleep(3)

if __name__ == "__main__":
    print("Starting consistent avatar generation...")
    generate_avatar_batch()