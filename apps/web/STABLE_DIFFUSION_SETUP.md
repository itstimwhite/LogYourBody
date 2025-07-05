# Stable Diffusion Setup for Consistent Avatar Generation

Since DALL-E 3 doesn't maintain consistency across generations, here are your options for generating consistent wireframe avatars:

## Option 1: Use Replicate (Recommended)

Replicate provides easy access to Stable Diffusion models with seed support for consistency.

### Setup:
1. Sign up at https://replicate.com
2. Get your API token from https://replicate.com/account/api-tokens
3. Add to your `.env` file:
   ```
   REPLICATE_API_TOKEN=r8_your_token_here
   ```
4. Run the script:
   ```bash
   source venv/bin/activate
   python scripts/generate-avatars-stable-diffusion.py
   ```

### Cost:
- Approximately $0.0011 per image
- 100 avatars ≈ $0.11 total

## Option 2: Use Hugging Face

Free tier available but requires authentication.

### Setup:
1. Sign up at https://huggingface.co
2. Get token from https://huggingface.co/settings/tokens
3. Add to your `.env` file:
   ```
   HUGGINGFACE_TOKEN=hf_your_token_here
   ```
4. Update and run the Hugging Face script

## Option 3: Local Stable Diffusion (Free but requires setup)

### Using ComfyUI (Easiest):
1. Download ComfyUI: https://github.com/comfyanonymous/ComfyUI
2. Install Stable Diffusion model
3. Use the ControlNet workflow for consistency
4. Batch process with fixed seed

### Using Automatic1111 WebUI:
1. Install: https://github.com/AUTOMATIC1111/stable-diffusion-webui
2. Enable API in settings
3. Use scripts with local API endpoint

## Option 4: Use the Programmatic Generator (Instant & Free)

If you need avatars immediately without any API setup:

```bash
python scripts/generate-wireframe-avatars.py
```

This generates geometrically consistent wireframe avatars programmatically.

## Why Stable Diffusion Over DALL-E 3?

1. **Seed Support**: Stable Diffusion supports seeds for reproducible results
2. **ControlNet**: Can use edge detection for consistent shapes
3. **Open Source**: More control over the generation process
4. **Cost Effective**: Can run locally for free

## Quick Test

To test if your setup works:
```bash
# For Replicate
python scripts/generate-avatars-stable-diffusion.py

# For programmatic generation (no setup needed)
python scripts/generate-wireframe-avatars.py
```