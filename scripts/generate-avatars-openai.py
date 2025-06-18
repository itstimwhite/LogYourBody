#!/usr/bin/env python3
"""
Script for generating avatar images using OpenAI DALL-E API.

IMPORTANT: 
- Never commit API keys to version control
- Store your API key in environment variables or a .env file
- Add .env to your .gitignore file

Usage:
1. Install dependencies: pip install openai python-dotenv requests pillow
2. Create a .env file with: OPENAI_API_KEY=your-key-here
3. Run: python scripts/generate-avatars-openai.py
"""

import json
import os
import time
import requests
from pathlib import Path
from PIL import Image, ImageOps
from io import BytesIO
import numpy as np

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI

# Initialize OpenAI client with API key from environment
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')  # Load from environment variable
)

def post_process_image(image):
    """Post-process image to ensure pure black background and white lines."""
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Convert to numpy array
    img_array = np.array(image)
    
    # Create a mask for non-black pixels (with some tolerance)
    # This helps preserve the white lines while ensuring black background
    gray = np.mean(img_array, axis=2)
    mask = gray > 30  # Threshold to identify white lines
    
    # Create new image with pure black background
    new_img = np.zeros_like(img_array)
    new_img[mask] = [255, 255, 255]  # Pure white for lines
    
    # Convert back to PIL Image
    return Image.fromarray(new_img.astype(np.uint8))

def download_image(url, save_path):
    """Download an image from URL and save it locally."""
    response = requests.get(url)
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        
        # Post-process for consistency
        image = post_process_image(image)
        
        # Resize to standard size
        image = image.resize((512, 512), Image.Resampling.LANCZOS)
        
        # Ensure it's saved as PNG
        image.save(save_path, 'PNG')
        return True
    return False

def generate_avatar(prompt, save_path, is_first_in_group=False):
    """Generate an avatar using DALL-E 3 and save it."""
    try:
        # Extract parameters
        gender = prompt.split('Gender: ')[1].split()[0].lower()
        body_fat = int(prompt.split('Body Fat: ')[1].split('%')[0])
        ffmi = float(prompt.split('FFMI: ')[1].split()[0])
        
        # Use a VERY specific visual description for consistency
        enhanced_prompt = f"""Create a technical diagram showing ONLY a torso wireframe.

MANDATORY VISUAL SPECIFICATIONS:
1. Background: Solid black (#000000)
2. Lines: Pure white (#FFFFFF), 2px width
3. Shape: Trapezoid/hourglass torso outline
4. Pattern: Triangle mesh inside (exactly 8 triangles wide)
5. Composition: Torso centered, fills 70% of frame height

EXACT CONSTRUCTION:
- Draw outer torso outline first (trapezoid shape)
- Fill with triangular mesh pattern
- No curves, only straight lines connecting vertices
- Like a paper origami template unfolded

TORSO MEASUREMENTS for {gender.upper()}, {body_fat}% fat, FFMI {ffmi}:
- Top width (shoulders): {70 + (ffmi-15)*3}% of frame
- Bottom width (waist): {50 + body_fat*0.3}% of shoulders
- Height: Fixed at 70% of frame
- Shape: {"V-shaped" if body_fat < 15 else "Straight" if body_fat < 25 else "Rectangular"}

VISUAL REFERENCE: Think of a triangulated mesh like in Blender's wireframe mode, but simplified to exactly 8 triangles across the width."""

        print(f"  Sending prompt to DALL-E 3...")
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        
        image_data = response.data[0]
        image_url = image_data.url
        
        # Download and save the image
        if download_image(image_url, save_path):
            print(f"  ✓ Generated and saved: {save_path}")
            return True
        else:
            print(f"  ✗ Failed to download image")
            return False
            
    except Exception as e:
        print(f"  ✗ Error generating image: {str(e)}")
        if hasattr(e, 'response'):
            print(f"  Response status: {getattr(e.response, 'status_code', 'N/A')}")
            print(f"  Response body: {getattr(e.response, 'text', 'N/A')}")
        return False

def main():
    # Check for API key
    if not os.getenv('OPENAI_API_KEY'):
        print("ERROR: OPENAI_API_KEY not found in environment variables")
        print("Please create a .env file with your API key or set it as an environment variable")
        return
    
    # Load specifications
    specs_path = Path(__file__).parent.parent / "public" / "avatars-new" / "generation-specs.json"
    with open(specs_path, 'r') as f:
        specs = json.load(f)
    
    print(f"Loaded {len(specs)} avatar specifications")
    
    # Start with a small batch to test consistency
    # Generate a few male avatars with different body fat percentages
    test_mode = False
    if test_mode:
        # Get male FFMI 20 with different body fat levels
        specs = [s for s in specs if s['gender'] == 'male' and s['ffmi'] == 20 and s['bodyFat'] in [10, 20, 30]]
        print(f"TEST MODE: Generating {len(specs)} test images for consistency check")
    
    # Create directories
    for spec in specs:
        Path(spec['path']).parent.mkdir(parents=True, exist_ok=True)
    
    # Sort specs by gender and FFMI to generate similar ones together
    # This can help with consistency
    specs_sorted = sorted(specs, key=lambda x: (x['gender'], x['ffmi'], x['bodyFat']))
    
    # Generate images with rate limiting
    successful = 0
    failed = 0
    
    print("\nGenerating avatars in groups for better consistency...")
    current_group = None
    group_reference_id = None
    
    for i, spec in enumerate(specs_sorted):
        group = f"{spec['gender']} FFMI {spec['ffmi']}"
        
        # Reset reference ID when starting a new group
        if group != current_group:
            current_group = group
            group_reference_id = None
            print(f"\n=== Starting group: {group} ===")
        
        print(f"\n[{i+1}/{len(specs_sorted)}] Generating: {spec['filename']}")
        print(f"  Body Fat: {spec['bodyFat']}%")
        
        # Generate avatar
        is_first = (group_reference_id is None)
        success = generate_avatar(spec['prompt'], spec['path'], is_first)
        
        if success:
            successful += 1
            if is_first:
                group_reference_id = True  # Mark that we have a reference
        else:
            failed += 1
        
        # Rate limiting: DALL-E 3 has limits
        if i < len(specs_sorted) - 1:
            # Shorter wait within same group, longer between groups
            next_group = f"{specs_sorted[i+1]['gender']} FFMI {specs_sorted[i+1]['ffmi']}"
            wait_time = 1 if group == next_group else 3
            print(f"  Waiting {wait_time} seconds...")
            time.sleep(wait_time)
    
    print(f"\nGeneration complete!")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    
    # Create avatar manifest
    if successful > 0:
        update_manifest(specs)

def update_manifest(specs):
    """Update the avatar manifest file."""
    manifest = {
        "version": "2.0",
        "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "style": "futuristic wireframe",
        "model": "dall-e-3",
        "avatars": {}
    }
    
    # Check which files actually exist
    for spec in specs:
        if Path(spec['path']).exists():
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
    
    print(f"\nManifest updated: {manifest_path}")

if __name__ == "__main__":
    main()