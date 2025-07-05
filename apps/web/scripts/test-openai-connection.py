#!/usr/bin/env python3
"""Test OpenAI API connection and generate a simple test image."""

import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

print("Testing OpenAI API connection...")
print(f"API Key (first 10 chars): {os.getenv('OPENAI_API_KEY')[:10]}...")

try:
    # Try a very simple, safe prompt
    print("\nGenerating test image with simple prompt...")
    response = client.images.generate(
        model="dall-e-3",
        prompt="A simple geometric pattern with circles and squares in black and white",
        size="1024x1024",
        quality="standard",
        n=1
    )
    
    print(f"Success! Image URL: {response.data[0].url[:50]}...")
    print("\nAPI connection is working!")
    
except Exception as e:
    print(f"\nError: {e}")
    if hasattr(e, 'response') and hasattr(e.response, 'json'):
        try:
            error_data = e.response.json()
            print(f"Error details: {error_data}")
        except:
            pass
    
    print("\nPossible issues:")
    print("1. Invalid API key")
    print("2. API key doesn't have image generation permissions")
    print("3. Account billing/quota issues")
    print("4. API key is for wrong organization")

print("\nChecking API key format...")
api_key = os.getenv('OPENAI_API_KEY', '')
if api_key.startswith('sk-'):
    print("✓ API key format looks correct")
else:
    print("✗ API key should start with 'sk-'")

if 'svcacct' in api_key:
    print("✓ Appears to be a service account key")
else:
    print("? Key type unclear")