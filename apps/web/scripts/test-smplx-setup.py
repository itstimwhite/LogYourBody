#!/usr/bin/env python3
import sys
import os

print("Checking SMPL-X setup...")

# Check imports
try:
    import torch
    print("✓ PyTorch installed")
except ImportError:
    print("✗ PyTorch not installed")
    sys.exit(1)

try:
    import smplx
    print("✓ SMPL-X library installed")
except ImportError:
    print("✗ SMPL-X library not installed")
    sys.exit(1)

try:
    import pyrender
    print("✓ PyRender installed")
except ImportError:
    print("✗ PyRender not installed")
    sys.exit(1)

# Check model files
model_path = "./assets/models/smplx"
required_files = ["SMPLX_MALE.npz", "SMPLX_FEMALE.npz"]
found_files = []

for file in required_files:
    if os.path.exists(os.path.join(model_path, file)):
        print(f"✓ {file} found")
        found_files.append(file)
    else:
        print(f"✗ {file} not found")

if len(found_files) == 0:
    print("\nNo SMPL-X models found! Please download from https://smpl-x.is.tue.mpg.de/")
    sys.exit(1)
elif len(found_files) < len(required_files):
    print("\nSome models are missing, but you can generate avatars for available models.")
    print("You can now run:")
    print("  python scripts/generate-smplx-avatars.py")
else:
    print("\nAll requirements satisfied! You can now run:")
    print("  python scripts/generate-smplx-avatars.py")
