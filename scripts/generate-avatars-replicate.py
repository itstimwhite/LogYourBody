#!/usr/bin/env python3
"""Generate consistent avatars using Replicate's Stable Diffusion API with seed support."""

import json
import os
import time
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import replicate

# Load environment variables
load_dotenv()

# Initialize Replicate client
# You'll need to set REPLICATE_API_TOKEN in your .env file
client = replicate.Client(api_token=os.getenv('REPLICATE_API_TOKEN'))

def download_image(url, save_path):
    """Download an image from URL and save it locally."""
    response = requests.get(url)
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        # Resize to standard size
        image = image.resize((512, 512), Image.Resampling.LANCZOS)
        # Ensure it's saved as PNG
        image.save(save_path, 'PNG')
        return True
    return False

def generate_avatar_with_seed(prompt, save_path, seed=42):
    """Generate an avatar using Stable Diffusion with a fixed seed."""
    try:
        # Using SDXL for better quality
        model = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
        
        # Create the prompt with consistent style instructions
        full_prompt = f"""{prompt}
        
Style: minimalist white wireframe on pure black background, technical drawing, CAD wireframe, low poly 3D mesh, geometric design, vector art, no shading, no gradients"""

        print(f"  Running Stable Diffusion with seed {seed}...")
        
        # Run the model with consistent parameters
        output = client.run(
            model,
            input={
                "prompt": full_prompt,
                "negative_prompt": "photo, realistic, human face, head, arms, legs, hands, feet, anatomical details, muscles, skin, clothing, shadows, gradients, 3d render, photograph",
                "width": 1024,
                "height": 1024,
                "seed": seed,  # Fixed seed for consistency
                "refine": "expert_ensemble_refiner",
                "scheduler": "K_EULER",
                "num_inference_steps": 25,
                "guidance_scale": 7.5,
                "prompt_strength": 0.8,
                "num_outputs": 1
            }
        )
        
        # Get the image URL from output
        if output and len(output) > 0:
            image_url = output[0]
            
            # Download and save the image
            if download_image(image_url, save_path):
                print(f"  ✓ Generated and saved: {save_path}")
                return True
        
        print(f"  ✗ Failed to generate image")
        return False
            
    except Exception as e:
        print(f"  ✗ Error generating image: {str(e)}")
        return False

def main():
    # Check for API key
    if not os.getenv('REPLICATE_API_TOKEN'):
        print("ERROR: REPLICATE_API_TOKEN not found in environment variables")
        print("Please create a .env file with your Replicate API token")
        print("Get your token at: https://replicate.com/account/api-tokens")
        return
    
    # Load specifications
    specs_path = Path(__file__).parent.parent / "public" / "avatars-new" / "generation-specs.json"
    with open(specs_path, 'r') as f:
        specs = json.load(f)
    
    print(f"Loaded {len(specs)} avatar specifications")
    
    # Test mode - generate a few samples first
    test_mode = True
    if test_mode:
        specs = [s for s in specs if s['gender'] == 'male' and s['ffmi'] == 20 and s['bodyFat'] in [10, 20, 30]]
        print(f"TEST MODE: Generating {len(specs)} test images")
    
    # Create directories
    for spec in specs:
        Path(spec['path']).parent.mkdir(parents=True, exist_ok=True)
    
    # Use consistent seed for all images
    base_seed = 42
    
    # Generate images
    successful = 0
    failed = 0
    
    for i, spec in enumerate(specs):
        print(f"\n[{i+1}/{len(specs)}] Generating: {spec['filename']}")
        print(f"  Gender: {spec['gender']}")
        print(f"  Body Fat: {spec['bodyFat']}%")
        print(f"  FFMI: {spec['ffmi']}")
        
        # Create specific prompt
        gender = spec['gender']
        body_fat = spec['bodyFat']
        ffmi = spec['ffmi']
        
        prompt = f"""Technical wireframe diagram of a {gender} torso shape only. 
Body fat percentage: {body_fat}% ({'very lean angular shape' if body_fat < 15 else 'lean defined shape' if body_fat < 20 else 'average shape' if body_fat < 30 else 'soft rounded shape'}).
Muscle mass FFMI {ffmi}: {'narrow build' if ffmi < 18 else 'average build' if ffmi < 21 else 'muscular build' if ffmi < 24 else 'very muscular build'}.
White lines on black background. Geometric wireframe mesh pattern. No head, arms, or legs - torso only."""
        
        if generate_avatar_with_seed(prompt, spec['path'], base_seed):
            successful += 1
        else:
            failed += 1
        
        # Rate limiting
        if i < len(specs) - 1:
            print("  Waiting 2 seconds before next image...")
            time.sleep(2)
    
    print(f"\nGeneration complete!")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    
    # Update manifest
    if successful > 0:
        update_manifest(specs)

def update_manifest(specs):
    """Update the avatar manifest file."""
    manifest = {
        "version": "2.0",
        "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "style": "wireframe - stable diffusion",
        "model": "stable-diffusion-xl",
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