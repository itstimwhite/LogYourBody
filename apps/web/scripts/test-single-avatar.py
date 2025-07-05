#!/usr/bin/env python3
"""Test generating a single avatar with the new consistent prompt."""

import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Import the generate_avatar function
exec(open('scripts/generate-avatars-openai.py').read(), globals())

# Test parameters
test_specs = [
    {
        "gender": "male",
        "bodyFat": 15,
        "ffmi": 20,
        "prompt": "Gender: male, Body Fat: 15%, FFMI: 20",
        "path": "test_avatar_1.png"
    },
    {
        "gender": "male", 
        "bodyFat": 15,
        "ffmi": 20,
        "prompt": "Gender: male, Body Fat: 15%, FFMI: 20",
        "path": "test_avatar_2.png"
    },
    {
        "gender": "male",
        "bodyFat": 30,
        "ffmi": 20,
        "prompt": "Gender: male, Body Fat: 30%, FFMI: 20",
        "path": "test_avatar_3.png"
    }
]

print("Testing avatar generation with new consistent prompt...")
print("Generating 3 test avatars:")
print("1. Male 15% BF, FFMI 20 (first)")
print("2. Male 15% BF, FFMI 20 (second - should be similar to first)")
print("3. Male 30% BF, FFMI 20 (should show more body fat)")
print()

for i, spec in enumerate(test_specs):
    print(f"\nGenerating test avatar {i+1}...")
    success = generate_avatar(spec['prompt'], spec['path'])
    if success:
        print(f"✓ Generated: {spec['path']}")
    else:
        print(f"✗ Failed to generate {spec['path']}")

print("\nTest complete! Check the generated images to see consistency.")