#!/usr/bin/env python3
"""Generate consistent avatars using Stable Diffusion with ControlNet on Replicate."""

import json
import os
import time
import requests
from pathlib import Path
from PIL import Image, ImageDraw
from io import BytesIO
from dotenv import load_dotenv
import replicate

# Load environment variables
load_dotenv()

# Initialize Replicate client
client = replicate.Client(api_token=os.getenv('REPLICATE_API_TOKEN'))

def create_control_image():
    """Create a simple wireframe control image for consistency."""
    img = Image.new('RGB', (512, 512), color='black')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple torso outline
    center_x = 256
    
    # Define torso shape points
    points = [
        (center_x - 100, 80),   # Left shoulder
        (center_x + 100, 80),   # Right shoulder
        (center_x + 90, 160),   # Right chest
        (center_x + 70, 380),   # Right waist
        (center_x - 70, 380),   # Left waist
        (center_x - 90, 160),   # Left chest
        (center_x - 100, 80)    # Back to start
    ]
    
    # Draw outline
    for i in range(len(points)-1):
        draw.line([points[i], points[i+1]], fill='white', width=3)
    
    # Add grid
    for y in range(120, 380, 40):
        draw.line([(center_x - 80, y), (center_x + 80, y)], fill='white', width=1)
    
    draw.line([(center_x, 100), (center_x, 360)], fill='white', width=1)
    
    # Save control image
    control_path = "control_torso.png"
    img.save(control_path)
    return control_path

def download_image(url, save_path):
    """Download and save image from URL."""
    response = requests.get(url)
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        image = image.resize((512, 512), Image.Resampling.LANCZOS)
        image.save(save_path, 'PNG')
        return True
    return False

def generate_avatar_with_controlnet(gender, body_fat, ffmi, save_path, control_image_path):
    """Generate avatar using Stable Diffusion with ControlNet."""
    
    # Build the prompt
    body_description = f"{gender} torso"
    if body_fat < 15:
        body_description += ", very lean, defined muscles"
    elif body_fat < 25:
        body_description += ", athletic build"
    elif body_fat < 35:
        body_description += ", average build"
    else:
        body_description += ", soft build"
    
    if ffmi < 18:
        body_description += ", slim frame"
    elif ffmi < 21:
        body_description += ", medium frame"
    elif ffmi < 24:
        body_description += ", muscular frame"
    else:
        body_description += ", very muscular frame"
    
    prompt = f"""minimalist wireframe diagram of {body_description}, white lines on black background, 
technical drawing style, geometric mesh pattern, low poly 3D wireframe, torso only no head or legs,
clean vector art, CAD drawing aesthetic, triangulated mesh"""
    
    negative_prompt = """photo, realistic, human face, head, arms, legs, hands, feet, detailed anatomy,
skin texture, clothing, shadows, gradients, colors, 3d render, photograph, blurry, text, watermark"""
    
    try:
        print(f"  Running Stable Diffusion with ControlNet...")
        
        # Using SDXL with Canny ControlNet for edge detection
        model = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
        
        # Upload control image to get a URL
        with open(control_image_path, "rb") as f:
            control_url = client.upload_file(f)
        
        output = client.run(
            "cjwbw/controlnet-canny:3990ba24ab3900865406ba4a1fc59413fa3ab12cf96dc88c47163bb7c5b12b66",
            input={
                "image": control_url,
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "num_inference_steps": 20,
                "guidance_scale": 7,
                "controlnet_conditioning_scale": 1.5,
                "seed": 42,  # Fixed seed for consistency
                "scheduler": "K_EULER_ANCESTRAL",
            }
        )
        
        # Get the output URL
        if output and len(output) > 0:
            image_url = output[0]
            
            if download_image(image_url, save_path):
                print(f"  ✓ Generated: {save_path}")
                return True
        
        print(f"  ✗ Failed to generate image")
        return False
        
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        
        # Fallback to regular SDXL without ControlNet
        print("  Trying fallback method without ControlNet...")
        try:
            model = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
            
            output = client.run(
                model,
                input={
                    "prompt": prompt + ", consistent style, technical blueprint",
                    "negative_prompt": negative_prompt,
                    "width": 1024,
                    "height": 1024,
                    "seed": 42,  # Fixed seed
                    "refine": "expert_ensemble_refiner",
                    "scheduler": "K_EULER",
                    "num_inference_steps": 25,
                    "guidance_scale": 7.5,
                    "prompt_strength": 0.9,
                }
            )
            
            if output and len(output) > 0:
                image_url = output[0]
                
                if download_image(image_url, save_path):
                    print(f"  ✓ Generated with fallback: {save_path}")
                    return True
                    
        except Exception as e2:
            print(f"  ✗ Fallback also failed: {str(e2)}")
        
        return False

def main():
    # Check for API token
    if not os.getenv('REPLICATE_API_TOKEN'):
        print("ERROR: REPLICATE_API_TOKEN not found in environment variables")
        print("\nTo get started:")
        print("1. Sign up at https://replicate.com")
        print("2. Get your API token from https://replicate.com/account/api-tokens")
        print("3. Add to .env file: REPLICATE_API_TOKEN=your-token-here")
        return
    
    # Create control image
    print("Creating control image for consistency...")
    control_image_path = create_control_image()
    
    # Load specifications
    specs_path = Path(__file__).parent.parent / "public" / "avatars-new" / "generation-specs.json"
    with open(specs_path, 'r') as f:
        all_specs = json.load(f)
    
    # Test mode - just a few avatars
    test_mode = True
    if test_mode:
        specs = [s for s in all_specs if s['gender'] == 'male' and s['ffmi'] == 20 and s['bodyFat'] in [10, 20, 30]]
        print(f"\nTEST MODE: Generating {len(specs)} test avatars")
    else:
        specs = all_specs
        print(f"\nGenerating {len(specs)} avatars")
    
    # Create directories
    for spec in specs:
        Path(spec['path']).parent.mkdir(parents=True, exist_ok=True)
    
    # Generate avatars
    successful = 0
    failed = 0
    
    for i, spec in enumerate(specs):
        print(f"\n[{i+1}/{len(specs)}] Generating: {spec['filename']}")
        print(f"  Gender: {spec['gender']}")
        print(f"  Body Fat: {spec['bodyFat']}%")
        print(f"  FFMI: {spec['ffmi']}")
        
        if generate_avatar_with_controlnet(
            spec['gender'],
            spec['bodyFat'],
            spec['ffmi'],
            spec['path'],
            control_image_path
        ):
            successful += 1
        else:
            failed += 1
        
        # Rate limiting
        if i < len(specs) - 1:
            print("  Waiting 3 seconds...")
            time.sleep(3)
    
    print(f"\nGeneration complete!")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    
    # Update manifest if successful
    if successful > 0:
        manifest = {
            "version": "2.0",
            "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
            "style": "stable diffusion wireframe",
            "model": "sdxl-controlnet",
            "avatars": {}
        }
        
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
    
    # Clean up control image
    if os.path.exists(control_image_path):
        os.remove(control_image_path)

if __name__ == "__main__":
    main()