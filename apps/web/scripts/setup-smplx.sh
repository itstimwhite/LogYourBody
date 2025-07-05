#!/bin/bash
# Setup script for SMPL-X avatar generation

echo "=== SMPL-X Avatar Generation Setup ==="
echo

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv-smplx

# Activate virtual environment
echo "Activating virtual environment..."
source venv-smplx/bin/activate

# Install requirements
echo "Installing Python requirements..."
pip install --upgrade pip
pip install -r scripts/requirements-smplx.txt

# Create directories
echo "Creating directory structure..."
mkdir -p assets/models/smplx
mkdir -p public/avatars-smplx

# Instructions for downloading SMPL-X
echo
echo "=== IMPORTANT: Manual Download Required ==="
echo
echo "To use SMPL-X models, you need to:"
echo "1. Visit https://smpl-x.is.tue.mpg.de/"
echo "2. Register and agree to the license terms"
echo "3. Download the SMPL-X model files"
echo "4. Extract the following files to ./assets/models/smplx/:"
echo "   - SMPLX_MALE.npz"
echo "   - SMPLX_FEMALE.npz"
echo "   - SMPLX_NEUTRAL.npz (optional)"
echo
echo "Once you have the models in place, run:"
echo "  source venv-smplx/bin/activate"
echo "  python scripts/generate-smplx-avatars.py"
echo

# Create a simple test script
cat > scripts/test-smplx-setup.py << 'EOF'
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
missing_files = []

for file in required_files:
    if os.path.exists(os.path.join(model_path, file)):
        print(f"✓ {file} found")
    else:
        print(f"✗ {file} not found")
        missing_files.append(file)

if missing_files:
    print("\nPlease download SMPL-X models from https://smpl-x.is.tue.mpg.de/")
    sys.exit(1)
else:
    print("\nAll requirements satisfied! You can now run:")
    print("  python scripts/generate-smplx-avatars.py")
EOF

chmod +x scripts/test-smplx-setup.py

echo "Setup complete! Run the test script to verify:"
echo "  python scripts/test-smplx-setup.py"