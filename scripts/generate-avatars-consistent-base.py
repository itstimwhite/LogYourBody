#!/usr/bin/env python3
"""Generate consistent avatars using OpenAI with a base reference approach."""

import json
import os
import time
import requests
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
from io import BytesIO
from dotenv import load_dotenv
from openai import OpenAI
import base64

# Load environment variables
load_dotenv()

# Initialize client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def create_base_wireframe():
    """Create a base wireframe template."""
    img = Image.new('RGB', (512, 512), color='black')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple wireframe torso
    center_x = 256
    
    # Torso outline points
    points = [
        (center_x - 90, 100),   # Left shoulder
        (center_x + 90, 100),   # Right shoulder
        (center_x + 80, 180),   # Right chest
        (center_x + 60, 380),   # Right waist
        (center_x - 60, 380),   # Left waist
        (center_x - 80, 180),   # Left chest
    ]
    
    # Draw triangulated mesh
    # Outline
    draw.polygon(points, outline='white', width=2)
    
    # Internal mesh
    # Horizontal lines
    for y in range(140, 380, 40):
        left_x = center_x - 80 + (y - 100) * 0.15
        right_x = center_x + 80 - (y - 100) * 0.15
        draw.line([(left_x, y), (right_x, y)], fill='white', width=1)
    
    # Vertical lines
    for x_offset in [-40, -20, 0, 20, 40]:
        top_y = 140
        bottom_y = 340
        draw.line([(center_x + x_offset, top_y), (center_x + x_offset, bottom_y)], fill='white', width=1)
    
    # Add diagonal lines for triangulation
    for i in range(5):
        y = 140 + i * 40
        for j in range(4):
            x = center_x - 60 + j * 40
            # Draw diagonals
            if i < 4 and j < 4:
                draw.line([(x, y), (x + 40, y + 40)], fill='white', width=1)
    
    return img

def generate_consistent_avatar(gender, body_fat, ffmi, save_path, base_image):
    """Generate avatar with extreme consistency requirements."""
    
    # Save base image to temp file
    temp_base = "temp_base.png"
    base_image.save(temp_base)
    
    # Encode base image
    with open(temp_base, "rb") as f:
        base64_image = base64.b64encode(f.read()).decode('utf-8')
    
    # Create very specific prompt
    prompt = f"""I need you to create a wireframe torso that looks EXACTLY like the reference image provided, with these specific modifications:

CRITICAL: The output must match the reference image's style EXACTLY:
- Same black background
- Same white line style
- Same triangulated mesh pattern
- Same composition and framing

ONLY MODIFY THESE PROPORTIONS:
- Gender: {gender} (affects shoulder-to-waist ratio)
- Body Fat: {body_fat}% (affects overall thickness)
- FFMI: {ffmi} (affects shoulder width)

Specific modifications:
- Shoulder width: {"narrow" if gender == "female" and ffmi < 18 else "medium" if ffmi < 21 else "broad"}
- Waist taper: {"strong V-shape" if body_fat < 15 else "moderate taper" if body_fat < 25 else "minimal taper"}
- Overall shape: {"angular" if body_fat < 20 else "smooth"}

IMPORTANT: Keep everything else IDENTICAL to the reference - same mesh pattern, same line style, same pose."""

    try:
        print(f"  Generating with base reference...")
        
        # Try using DALL-E 3 with image editing
        response = client.images.create_variation(
            image=open(temp_base, "rb"),
            n=1,
            size="1024x1024"
        )
        
        image_url = response.data[0].url
        
        # Download and process
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            image = Image.open(BytesIO(img_response.content))
            
            # Post-process for consistency
            image = image.convert('L')  # Grayscale
            # Threshold to pure black/white
            image = image.point(lambda p: 255 if p > 100 else 0)
            image = image.resize((512, 512), Image.Resampling.LANCZOS)
            
            image.save(save_path, 'PNG')
            print(f"  ✓ Generated: {save_path}")
            
            # Clean up
            os.remove(temp_base)
            return True
            
    except Exception as e:
        print(f"  ✗ Variation API not available, trying generation...")
        
        # Fallback to regular generation with strong style reference
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt + "\n\nStyle: EXACTLY like a low-poly 3D wireframe mesh, pure white lines on black, no shading",
                size="1024x1024",
                quality="standard",
                n=1
            )
            
            image_url = response.data[0].url
            
            # Download and process
            img_response = requests.get(image_url)
            if img_response.status_code == 200:
                image = Image.open(BytesIO(img_response.content))
                
                # Post-process
                image = image.convert('L')
                image = image.point(lambda p: 255 if p > 100 else 0)
                image = image.resize((512, 512), Image.Resampling.LANCZOS)
                
                image.save(save_path, 'PNG')
                print(f"  ✓ Generated with fallback: {save_path}")
                return True
                
        except Exception as e2:
            print(f"  ✗ Error: {str(e2)}")
    
    # Clean up
    if os.path.exists(temp_base):
        os.remove(temp_base)
    
    return False

def main():
    if not os.getenv('OPENAI_API_KEY'):
        print("ERROR: OPENAI_API_KEY not found")
        return
    
    # Create base wireframe
    print("Creating base wireframe template...")
    base_image = create_base_wireframe()
    base_image.save("base_wireframe_template.png")
    print("Base template saved as: base_wireframe_template.png")
    
    # Test avatars
    test_avatars = [
        {"gender": "male", "bodyFat": 10, "ffmi": 20, "path": "public/avatars-new/test_consistent_1.png"},
        {"gender": "male", "bodyFat": 20, "ffmi": 20, "path": "public/avatars-new/test_consistent_2.png"},
        {"gender": "male", "bodyFat": 30, "ffmi": 20, "path": "public/avatars-new/test_consistent_3.png"},
    ]
    
    print("\nGenerating test avatars with base reference...")
    
    for i, avatar in enumerate(test_avatars):
        print(f"\n[{i+1}/3] Generating test avatar...")
        print(f"  Body Fat: {avatar['bodyFat']}%")
        
        Path(avatar['path']).parent.mkdir(parents=True, exist_ok=True)
        
        success = generate_consistent_avatar(
            avatar['gender'],
            avatar['bodyFat'],
            avatar['ffmi'],
            avatar['path'],
            base_image
        )
        
        if not success:
            print("Failed to generate avatar")
        
        # Rate limit
        time.sleep(2)
    
    print("\nTest complete!")

if __name__ == "__main__":
    main()