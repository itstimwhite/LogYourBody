# Avatar Pre-rendering System

This system pre-generates 3,600 wireframe torso avatars covering every combination of body composition parameters.

## Overview

**Goal**: Pre-render torso wireframe avatars for every combination of:

- **Body Fat %**: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 (10 values)
- **FFMI**: 14-25 (12 integer values)
- **Age Range**: 0-4 indices → 18-25, 26-35, 36-45, 46-55, 56-65 (5 ranges)
- **Sex**: 'm', 'f' (2 values)
- **Stature**: 's' (≤1.65m), 'm' (1.66-1.85m), 't' (≥1.86m) (3 values)

**Total Renditions**: 10 × 12 × 5 × 2 × 3 = **3,600 avatars**

## File Structure

```
scripts/
├── render-avatars.ts          # Full TypeScript renderer (Three.js + headless GL)
├── simple-avatar-generator.cjs # Manifest generator
├── test-render.cjs            # Basic rendering test
├── tsconfig.json              # TypeScript config for scripts
└── README.md                  # This file

public/avatars/
├── avatar-manifest.json       # Generated manifest with all filenames
└── [3600 avatar PNG files]    # Generated wireframe images
```

## NPM Scripts

```bash
# Generate avatar manifest (quick test)
npm run render:avatars

# Full avatar rendering (when Three.js setup is complete)
npm run render:avatars:full
```

## Avatar Filename Convention

Each avatar follows the pattern:

```
{sex}_bf{bodyFat}_ffmi{ffmi}_age{ageIdx}_{stature}.png
```

**Examples:**

- `m_bf15_ffmi20_age2_m.png` - Male, 15% body fat, FFMI 20, age range 36-45, medium stature
- `f_bf25_ffmi16_age0_s.png` - Female, 25% body fat, FFMI 16, age range 18-25, short stature

## Morphing Logic

The system applies these transformations to base torso meshes:

### Muscle Morphing (FFMI)

```typescript
muscleMorph = clamp((ffmi - 14) / (25 - 14), 0, 1);
// Affects width and muscle definition
```

### Fat Morphing (Body Fat %)

```typescript
fatMorph = clamp((bodyFat - 5) / (50 - 5), 0, 1);
// Affects overall size and shape distribution
```

### Age Morphing

```typescript
ageMorph = ageRangeIdx / 4;
// Affects posture and slight height changes
```

### Stature Scaling

```typescript
(scale = 1.0(medium)), 0.9(short), 1.1(tall);
```

### Gender-Specific Fat Distribution

- **Female**: More hip/thigh emphasis
- **Male**: More abdominal emphasis

## Rendering Specifications

- **Format**: PNG, 1080×1080 pixels
- **Background**: Black (`#0d0d0d`)
- **Wireframe**: White lines (`#ffffff`), 1px stroke
- **Camera**: Orthographic front view
- **Geometry**: `THREE.WireframeGeometry` from morphed torso meshes

## Current Status

✅ **Completed:**

- Parameter combination logic (3,600 confirmed)
- Filename convention system
- Morphing algorithms
- TypeScript rendering framework
- NPM script integration

🚧 **In Progress:**

- Three.js headless rendering setup
- SMPL-X mesh integration
- Batch processing optimization

## Usage in App

Once generated, avatars can be loaded by constructing the filename:

```typescript
function getAvatarUrl(params: AvatarParams): string {
  const { bodyFat, ffmi, ageRangeIdx, sex, stature } = params;
  return `/avatars/${sex}_bf${bodyFat}_ffmi${ffmi}_age${ageRangeIdx}_${stature}.png`;
}
```

## Next Steps

1. **Fix Three.js headless rendering** - Resolve WebGL context issues
2. **Add SMPL-X models** - Replace procedural cylinders with realistic meshes
3. **Optimize batch processing** - Add progress tracking and memory management
4. **CDN deployment** - Upload generated avatars to static hosting
5. **Fallback system** - Handle missing avatar files gracefully
