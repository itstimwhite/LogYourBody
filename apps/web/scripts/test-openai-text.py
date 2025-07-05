#!/usr/bin/env python3
"""Test if OpenAI API key works for text generation."""

import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

print("Testing OpenAI API with text generation...")

try:
    # Test with a simple chat completion
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": "Say 'Hello, API is working!'"}
        ],
        max_tokens=50
    )
    
    print(f"Success! Response: {response.choices[0].message.content}")
    print("\nAPI key works for text generation!")
    print("The issue might be specific to DALL-E image generation permissions.")
    
except Exception as e:
    print(f"\nError with text generation too: {e}")
    print("\nThis suggests the API key might be:")
    print("- Invalid or revoked")
    print("- Associated with an account without any API access")
    print("- Missing required permissions")

# Try to list available models
print("\nTrying to list available models...")
try:
    models = client.models.list()
    print("Available models:")
    dall_e_found = False
    for model in models.data[:10]:  # Show first 10
        print(f"  - {model.id}")
        if 'dall-e' in model.id:
            dall_e_found = True
    
    if not dall_e_found:
        print("\n⚠️  No DALL-E models found in available models list!")
        print("This confirms the API key doesn't have image generation access.")
        
except Exception as e:
    print(f"Error listing models: {e}")