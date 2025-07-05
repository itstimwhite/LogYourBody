#!/usr/bin/env python3
"""Test generating consistent avatars with specific wireframe prompt."""

import os
from dotenv import load_dotenv
from openai import OpenAI
import requests
from PIL import Image
from io import BytesIO

# Load environment variables
load_dotenv()

# Initialize client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Test prompt for consistency
test_prompt = """Create a minimalist futuristic wireframe avatar. STRICT REQUIREMENTS:

STYLE:
- Pure white lines on solid black background (#000000)
- Thin geometric wireframe lines only (1-2px width)
- NO shading, NO gradients, NO fills, NO colors
- Cyberpunk/TRON aesthetic wireframe
- Technical blueprint style

COMPOSITION:
- Show ONLY the torso from shoulders to waist
- Centered, front-facing view
- Symmetrical pose
- No head, no arms below shoulders, no legs

WIREFRAME STRUCTURE:
- Hexagonal mesh pattern for the base structure
- Connecting lines forming the torso outline
- Grid-like wireframe overlay

BODY VARIATIONS (adjust wireframe density and shape):
- Gender: male torso shape (wider shoulders, narrower hips)
- Body Fat 15%: moderate wireframe density
- FFMI 20: moderate muscle wireframe

CONSISTENCY:
- Keep the exact same pose and angle for all variations
- Only adjust the wireframe shape/density based on parameters
- Maintain identical composition and framing"""

print("Testing avatar generation for consistency...")
print("Generating test avatar with male, 15% BF, FFMI 20...")

try:
    response = client.images.generate(
        model="dall-e-3",
        prompt=test_prompt,
        size="1024x1024",
        quality="standard",
        n=1
    )
    
    image_url = response.data[0].url
    print(f"Success! Image URL: {image_url[:50]}...")
    
    # Download and save
    img_response = requests.get(image_url)
    if img_response.status_code == 200:
        image = Image.open(BytesIO(img_response.content))
        image.save("test_wireframe_avatar.png", 'PNG')
        print("Saved as: test_wireframe_avatar.png")
    
except Exception as e:
    print(f"Error: {e}")

print("\nPlease check the generated image to see if it matches requirements.")