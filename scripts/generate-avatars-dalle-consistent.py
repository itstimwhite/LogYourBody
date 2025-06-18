#!/usr/bin/env python3
"""Generate consistent avatars using DALL-E 3 with extremely specific prompts."""

import json
import os
import time
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def download_and_process_image(url, save_path):
    """Download and ensure consistent processing."""
    response = requests.get(url)
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        
        # Convert to pure black and white
        image = image.convert('L')  # Grayscale
        # Apply threshold to make pure black/white
        threshold = 128
        image = image.point(lambda p: 255 if p > threshold else 0)
        
        # Resize to consistent size
        image = image.resize((512, 512), Image.Resampling.LANCZOS)
        
        # Save as PNG
        image.save(save_path, 'PNG')
        return True
    return False

def generate_avatar(gender, body_fat, ffmi, save_path):
    """Generate avatar with ultra-specific prompt."""
    
    # Calculate specific proportions
    shoulder_width_percent = 40 + (ffmi - 15) * 2
    if gender == 'female':
        shoulder_width_percent *= 0.9
    
    waist_width_percent = 65 + body_fat * 0.5
    
    # Create an extremely rigid prompt
    prompt = f"""INSTRUCTIONS: Draw exactly this shape:

1. Start with pure black square canvas
2. Draw a white trapezoid shape:
   - Top line (shoulders): {shoulder_width_percent}% of canvas width
   - Bottom line (waist): {waist_width_percent}% of top line width
   - Height: 70% of canvas height
   - Center it perfectly
3. Inside the trapezoid, draw a grid:
   - Exactly 6 horizontal lines evenly spaced
   - Exactly 5 vertical lines evenly spaced
   - All lines are white, 2 pixels thick
4. NOTHING ELSE - no curves, no details, no shading

This represents: {gender} torso, {body_fat}% body fat, FFMI {ffmi}

Style: Technical wireframe diagram, like graph paper or CAD drawing"""

    try:
        print(f"  Generating with rigid specifications...")
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        
        image_url = response.data[0].url
        
        if download_and_process_image(image_url, save_path):
            print(f"  ✓ Generated: {save_path}")
            return True
        else:
            print(f"  ✗ Failed to process image")
            return False
            
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        return False

def main():
    if not os.getenv('OPENAI_API_KEY'):
        print("ERROR: OPENAI_API_KEY not found")
        return
    
    # Test with a small batch
    test_avatars = [
        {"gender": "male", "bodyFat": 10, "ffmi": 20, "filename": "test_m_20_10.png"},
        {"gender": "male", "bodyFat": 20, "ffmi": 20, "filename": "test_m_20_20.png"},
        {"gender": "male", "bodyFat": 30, "ffmi": 20, "filename": "test_m_20_30.png"},
    ]
    
    print("Generating test avatars with ultra-specific prompts...")
    
    output_dir = Path("public/avatars-test")
    output_dir.mkdir(exist_ok=True)
    
    for avatar in test_avatars:
        print(f"\nGenerating {avatar['filename']}...")
        save_path = output_dir / avatar['filename']
        
        success = generate_avatar(
            avatar['gender'],
            avatar['bodyFat'],
            avatar['ffmi'],
            save_path
        )
        
        if not success:
            print("Failed to generate avatar")
        
        # Rate limit
        time.sleep(2)
    
    print("\nTest complete! Check public/avatars-test/ for results")

if __name__ == "__main__":
    main()