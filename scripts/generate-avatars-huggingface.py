#!/usr/bin/env python3
"""Generate consistent avatars using Hugging Face's Stable Diffusion API."""

import json
import os
import time
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Hugging Face API endpoint
API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"

def query_huggingface(payload, api_token):
    """Query Hugging Face API."""
    headers = {"Authorization": f"Bearer {api_token}"}
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

def generate_avatar_hf(gender, body_fat, ffmi, save_path, api_token):
    """Generate avatar using Hugging Face Stable Diffusion."""
    
    # Build consistent prompt
    prompt = f"""minimalist wireframe torso diagram, technical drawing style, white lines on pure black background,
geometric triangulated mesh pattern, low poly 3D wireframe style, {gender} torso shape only no head or limbs,
body fat {body_fat}% {"lean" if body_fat < 20 else "average" if body_fat < 30 else "soft"},
muscle mass ffmi {ffmi} {"slim" if ffmi < 18 else "medium" if ffmi < 21 else "muscular"},
CAD drawing aesthetic, vector art style, consistent technical blueprint look"""
    
    # Add negative prompt for consistency
    negative_prompt = "photo, realistic, human, face, head, arms, legs, detailed, shaded, gradient, color, 3d render"
    
    # Parameters for consistency
    payload = {
        "inputs": prompt,
        "negative_prompt": negative_prompt,
        "num_inference_steps": 30,
        "guidance_scale": 7.5,
        "seed": 42,  # Fixed seed for consistency
        "parameters": {
            "negative_prompt": negative_prompt,
            "seed": 42
        }
    }
    
    try:
        print(f"  Querying Hugging Face API...")
        image_bytes = query_huggingface(payload, api_token)
        
        # Check if we got an image
        try:
            image = Image.open(BytesIO(image_bytes))
            
            # Post-process for consistency
            image = image.convert('L')  # Convert to grayscale
            # Apply threshold for pure black/white
            image = image.point(lambda p: 255 if p > 128 else 0)
            # Resize to standard size
            image = image.resize((512, 512), Image.Resampling.LANCZOS)
            
            # Save
            image.save(save_path, 'PNG')
            print(f"  ✓ Generated: {save_path}")
            return True
            
        except Exception as e:
            # Check if it's a JSON error response
            try:
                error_data = json.loads(image_bytes)
                print(f"  ✗ API Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"  ✗ Failed to process image: {str(e)}")
            return False
            
    except Exception as e:
        print(f"  ✗ Request failed: {str(e)}")
        return False

def main():
    # Check for Hugging Face token
    hf_token = os.getenv('HUGGINGFACE_TOKEN')
    if not hf_token:
        print("No HUGGINGFACE_TOKEN found. Attempting without authentication...")
        print("Note: This may be rate limited. For better access:")
        print("1. Sign up at https://huggingface.co")
        print("2. Get token from https://huggingface.co/settings/tokens")
        print("3. Add to .env: HUGGINGFACE_TOKEN=your-token-here")
        hf_token = ""  # Try without token
    
    # Test avatars
    test_avatars = [
        {"gender": "male", "bodyFat": 10, "ffmi": 20},
        {"gender": "male", "bodyFat": 20, "ffmi": 20},
        {"gender": "male", "bodyFat": 30, "ffmi": 20},
        {"gender": "female", "bodyFat": 20, "ffmi": 18},
    ]
    
    print("\nGenerating test avatars with Hugging Face...")
    
    output_dir = Path("public/avatars-hf-test")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for i, avatar in enumerate(test_avatars):
        filename = f"{avatar['gender']}_bf{avatar['bodyFat']}_ffmi{avatar['ffmi']}.png"
        save_path = output_dir / filename
        
        print(f"\n[{i+1}/{len(test_avatars)}] Generating: {filename}")
        print(f"  Gender: {avatar['gender']}")
        print(f"  Body Fat: {avatar['bodyFat']}%")
        print(f"  FFMI: {avatar['ffmi']}")
        
        success = generate_avatar_hf(
            avatar['gender'],
            avatar['bodyFat'],
            avatar['ffmi'],
            save_path,
            hf_token
        )
        
        # Rate limiting
        if i < len(test_avatars) - 1:
            wait_time = 5 if not hf_token else 2
            print(f"  Waiting {wait_time} seconds...")
            time.sleep(wait_time)
    
    print("\nTest complete! Check public/avatars-hf-test/ for results")

if __name__ == "__main__":
    main()