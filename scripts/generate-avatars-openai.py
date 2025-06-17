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
from PIL import Image
from io import BytesIO

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI

# Initialize OpenAI client with API key from environment
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')  # Load from environment variable
)

def download_image(url, save_path):
    """Download an image from URL and save it locally."""
    response = requests.get(url)
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        # Ensure it's saved as PNG
        image.save(save_path, 'PNG')
        return True
    return False

def generate_avatar(prompt, save_path):
    """Generate an avatar using DALL-E 3 and save it."""
    try:
        # Enhanced prompt for better results
        enhanced_prompt = f"""{prompt}
Additional requirements:
- Ultra high contrast: pure white lines on pure black background
- No gradients, no shading, only clean line art
- Wireframe/blueprint style
- Symmetrical and centered
- Professional medical illustration quality
- Show anatomical accuracy for the specified body composition"""

        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size="1024x1024",
            quality="hd",
            n=1,
            style="vivid"
        )
        
        image_url = response.data[0].url
        
        # Download and save the image
        if download_image(image_url, save_path):
            print(f"  ✓ Generated and saved: {save_path}")
            return True
        else:
            print(f"  ✗ Failed to download image")
            return False
            
    except Exception as e:
        print(f"  ✗ Error generating image: {e}")
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
    
    # Optional: Start with a specific subset for testing
    # For example, only generate male avatars with 20 FFMI first
    test_mode = True
    if test_mode:
        specs = [s for s in specs if s['gender'] == 'male' and s['ffmi'] == 20][:3]
        print(f"TEST MODE: Only generating {len(specs)} images")
    
    # Create directories
    for spec in specs:
        Path(spec['path']).parent.mkdir(parents=True, exist_ok=True)
    
    # Generate images with rate limiting
    successful = 0
    failed = 0
    
    for i, spec in enumerate(specs):
        print(f"\n[{i+1}/{len(specs)}] Generating: {spec['filename']}")
        print(f"  Gender: {spec['gender']}")
        print(f"  Body Fat: {spec['bodyFat']}%")
        print(f"  FFMI: {spec['ffmi']}")
        
        if generate_avatar(spec['prompt'], spec['path']):
            successful += 1
        else:
            failed += 1
        
        # Rate limiting: DALL-E 3 has limits
        if i < len(specs) - 1:
            print("  Waiting 2 seconds before next image...")
            time.sleep(2)
    
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