# SMPL-X Avatar Generation Guide

This guide explains how to generate high-quality 3D wireframe avatars using SMPL-X body models for LogYourBody.

## Overview

SMPL-X (Expressive Body Model) is a sophisticated 3D body model that can generate realistic human body shapes based on parameters. We use it to create wireframe avatars that accurately represent different body compositions based on:
- Body Fat Percentage (BF%)
- Fat-Free Mass Index (FFMI)
- Gender

## Setup Instructions

### 1. Install Dependencies

```bash
# Create and activate virtual environment
python3 -m venv venv-smplx
source venv-smplx/bin/activate  # On Windows: venv-smplx\Scripts\activate

# Install requirements
pip install -r scripts/requirements-smplx.txt
```

### 2. Download SMPL-X Models

1. Visit https://smpl-x.is.tue.mpg.de/
2. Register for an account and agree to the license terms
3. Download the SMPL-X model files
4. Extract these files to `./assets/models/smplx/`:
   - `SMPLX_MALE.npz`
   - `SMPLX_FEMALE.npz`
   - `SMPLX_NEUTRAL.npz` (optional)

### 3. Generate Avatars

```bash
# Run the generation script
python scripts/generate-smplx-avatars.py
```

This will generate:
- 2 genders (male, female)
- 5 FFMI values (15, 17.5, 20, 22.5, 25)
- 10 body fat percentages (5%, 10%, 15%, 20%, 25%, 30%, 35%, 40%, 45%, 50%)
- Total: 100 unique avatar images

## Technical Details

### Shape Parameter Mapping

The script maps body composition metrics to SMPL-X's 10-dimensional shape space:
- **Beta 0**: Overall body size
- **Beta 1**: Muscle mass
- **Beta 2**: Body fat
- **Beta 3-9**: Body proportions and shape details

The mapping uses linear regression calibrated on sample data points that represent typical body compositions.

### Rendering

Avatars are rendered as wireframes with:
- Light purple wireframe on dark background
- 512x640 resolution
- Neutral standing pose
- Consistent camera angle and lighting

## Integration

### Using SMPL-X Avatars in the App

1. The avatars are automatically detected if present in `/public/avatars-smplx/`
2. The app will use SMPL-X avatars when available, falling back to the pravatar system
3. Import the enhanced avatar utility:

```typescript
import { getAvatarUrl } from '@/utils/avatar-utils-smplx'

// Get avatar URL with FFMI
const avatarUrl = getAvatarUrl('male', 15, 22.5)
```

### File Structure

```
public/avatars-smplx/
├── avatar-manifest.json
├── male/
│   ├── ffmi15/
│   │   ├── male_ffmi15_bf5.png
│   │   ├── male_ffmi15_bf10.png
│   │   └── ...
│   ├── ffmi17_5/
│   └── ...
└── female/
    ├── ffmi15/
    └── ...
```

## Customization

### Adjusting Body Shape Mapping

Edit the `_initialize_shape_mapper()` method in `generate-smplx-avatars.py` to adjust how BF% and FFMI map to body shapes:

```python
# Example: Adjust muscle definition for low body fat
samples = [
    # (BF%, FFMI) -> [size, muscle, fat, ...]
    (5, 25, [0.5, 2.5, -2.5, 0.3, -0.1, 0, 0, 0, 0, 0]),  # More muscle definition
]
```

### Changing Avatar Style

Modify the rendering in `render_wireframe()`:

```python
# Change wireframe color
material = pyrender.MetallicRoughnessMaterial(
    baseColorFactor=[0.7, 0.5, 0.9, 1.0],  # RGBA color
    wireframe=True
)

# Change background color
bg = Image.new('RGBA', img.size, (20, 20, 30, 255))  # Dark blue-gray
```

## Troubleshooting

### Common Issues

1. **"SMPL-X models not found"**
   - Ensure you've downloaded and extracted the models to `./assets/models/smplx/`

2. **Rendering errors**
   - Install system dependencies: `sudo apt-get install libgl1-mesa-glx` (Linux)
   - For headless servers, install OSMesa: `conda install -c conda-forge osmesa`

3. **Memory issues**
   - Reduce batch size by generating fewer avatars at once
   - Use CPU instead of GPU by setting `CUDA_VISIBLE_DEVICES=""`

## License

SMPL-X models are subject to their own license terms. Please ensure you comply with the SMPL-X license available at https://smpl-x.is.tue.mpg.de/