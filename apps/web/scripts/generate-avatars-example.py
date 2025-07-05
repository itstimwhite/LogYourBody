#!/usr/bin/env python3
"""
Example script for generating avatar images using AI image generation APIs.

This script provides a template for generating the avatar images.
You'll need to:
1. Install required packages: pip install openai pillow requests
2. Set up your API key for your chosen service
3. Modify the generate_image function for your specific API
"""

import json
import os
import time
from pathlib import Path

# Example for OpenAI (you'll need to add your API key)
# import openai
# openai.api_key = "your-api-key-here"

def generate_image(prompt, filename):
    """
    Replace this function with your actual image generation code.
    
    Examples for different services:
    
    # OpenAI DALL-E 3 Example:
    response = openai.Image.create(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="hd",
        n=1,
        style="vivid"
    )
    image_url = response['data'][0]['url']
    # Download and save the image
    
    # Stable Diffusion Example:
    # Use your preferred SD API or local installation
    
    # Midjourney Example:
    # Use Discord bot API or web API
    """
    print(f"Would generate: {filename}")
    print(f"Prompt: {prompt[:100]}...")
    # Placeholder - replace with actual generation
    return True

def main():
    # Load specifications
    specs_path = Path(__file__).parent.parent / "public" / "avatars-new" / "generation-specs.json"
    with open(specs_path, 'r') as f:
        specs = json.load(f)
    
    print(f"Loaded {len(specs)} avatar specifications")
    
    # Create directories if they don't exist
    for spec in specs:
        Path(spec['path']).parent.mkdir(parents=True, exist_ok=True)
    
    # Generate images in batches to avoid rate limits
    batch_size = 5
    delay_between_batches = 60  # seconds
    
    for i in range(0, len(specs), batch_size):
        batch = specs[i:i+batch_size]
        print(f"\nProcessing batch {i//batch_size + 1} of {len(specs)//batch_size + 1}")
        
        for spec in batch:
            print(f"\nGenerating: {spec['filename']}")
            print(f"  Gender: {spec['gender']}")
            print(f"  Body Fat: {spec['bodyFat']}%")
            print(f"  FFMI: {spec['ffmi']}")
            
            try:
                success = generate_image(spec['prompt'], spec['path'])
                if success:
                    print(f"  ✓ Generated successfully")
                else:
                    print(f"  ✗ Generation failed")
            except Exception as e:
                print(f"  ✗ Error: {e}")
            
            # Small delay between images
            time.sleep(2)
        
        # Delay between batches
        if i + batch_size < len(specs):
            print(f"\nWaiting {delay_between_batches} seconds before next batch...")
            time.sleep(delay_between_batches)
    
    print("\nGeneration complete!")
    
    # Update avatar manifest
    manifest = {
        "version": "2.0",
        "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_images": len(specs),
        "body_fat_range": [5, 50],
        "ffmi_values": [15, 17.5, 20, 22.5, 25],
        "genders": ["male", "female"],
        "style": "futuristic wireframe",
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
    
    print(f"\nManifest saved to: {manifest_path}")

if __name__ == "__main__":
    main()