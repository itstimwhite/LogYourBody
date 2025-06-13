#!/usr/bin/env ts-node

import * as THREE from 'three';
import { createCanvas } from 'canvas';
import { promises as fs } from 'fs';
import * as path from 'path';

// Setup headless GL context
const gl = require('gl');

interface AvatarParams {
  bodyFat: number;      // 5-50%
  ffmi: number;         // 14-25
  ageRangeIdx: number;  // 0-4 (18-25, 26-35, 36-45, 46-55, 56-65)
  sex: 'm' | 'f';
  stature: 's' | 'm' | 't'; // short ≤1.65m, medium 1.66-1.85m, tall ≥1.86m
}

interface MorphTargets {
  muscleMorph: number;  // 0-1 based on FFMI
  fatMorph: number;     // 0-1 based on body fat
  ageMorph: number;     // 0-1 based on age range
  scale: number;        // scaling factor based on stature
}

class AvatarRenderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private maleMesh?: THREE.Mesh;
  private femaleMesh?: THREE.Mesh;
  
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d0d0d); // Black background
    
    // Setup orthographic camera for front view
    const size = 2;
    this.camera = new THREE.OrthographicCamera(
      -size, size, size, -size, 0.1, 1000
    );
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
    
    // Create headless WebGL renderer
    const canvas = createCanvas(1080, 1080);
    const context = gl(1080, 1080, { preserveDrawingBuffer: true });
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas as any,
      context: context,
      preserveDrawingBuffer: true,
      alpha: false,
      antialias: true
    });
    
    this.renderer.setSize(1080, 1080);
    this.renderer.setClearColor(0x0d0d0d, 1.0);
  }

  async loadMeshes(): Promise<void> {
    console.log('Creating procedural torso meshes...');
    
    try {
      // Create procedural male torso
      this.maleMesh = this.createMaleTorso();
      
      // Create procedural female torso
      this.femaleMesh = this.createFemaleTorso();
      
      console.log('Procedural meshes created successfully');
    } catch (error) {
      console.error('Error creating meshes:', error);
      throw error;
    }
  }


  private createMaleTorso(): THREE.Mesh {
    // Create a basic male torso shape using cylinder + sphere combinations
    const geometry = new THREE.CylinderGeometry(
      0.4,  // radiusTop (shoulders)
      0.35, // radiusBottom (waist) 
      1.8,  // height
      16,   // radialSegments
      8     // heightSegments
    );
    
    // Add basic material (will be converted to wireframe)
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position torso
    mesh.position.y = 0;
    
    return mesh;
  }

  private createFemaleTorso(): THREE.Mesh {
    // Create a basic female torso shape - slightly different proportions
    const geometry = new THREE.CylinderGeometry(
      0.35, // radiusTop (shoulders, narrower than male)
      0.4,  // radiusBottom (hips, wider than male)
      1.7,  // height (slightly shorter)
      16,   // radialSegments
      8     // heightSegments
    );
    
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.y = 0;
    
    return mesh;
  }

  private calculateMorphTargets(params: AvatarParams): MorphTargets {
    // Calculate muscle morph based on FFMI (14-25 range)
    const muscleMorph = Math.max(0, Math.min(1, (params.ffmi - 14) / (25 - 14)));
    
    // Calculate fat morph based on body fat percentage (5-50% range)
    const fatMorph = Math.max(0, Math.min(1, (params.bodyFat - 5) / (50 - 5)));
    
    // Calculate age morph (0-4 age range indices)
    const ageMorph = params.ageRangeIdx / 4;
    
    // Calculate scale based on stature
    let scale = 1.0; // medium stature baseline
    if (params.stature === 's') scale = 0.9; // short
    if (params.stature === 't') scale = 1.1; // tall
    
    return { muscleMorph, fatMorph, ageMorph, scale };
  }

  private applyMorphs(mesh: THREE.Mesh, morphs: MorphTargets, params: AvatarParams): THREE.Mesh {
    const morphedMesh = mesh.clone();
    
    // Apply base scaling for stature
    morphedMesh.scale.setScalar(morphs.scale);
    
    // Apply muscle morphing - affects width and definition
    const muscleScale = 1 + (morphs.muscleMorph * 0.25); // Up to 25% muscle mass increase
    morphedMesh.scale.x *= muscleScale;
    morphedMesh.scale.z *= muscleScale;
    
    // Apply fat morphing - affects overall size and shape
    const fatScale = 1 + (morphs.fatMorph * 0.4); // Up to 40% size increase for fat
    morphedMesh.scale.x *= fatScale;
    morphedMesh.scale.z *= fatScale;
    
    // Height changes less with fat
    const heightFatScale = 1 + (morphs.fatMorph * 0.1);
    morphedMesh.scale.y *= heightFatScale;
    
    // Age morphing - affects posture and slight shrinkage
    const ageScale = 1 - (morphs.ageMorph * 0.05); // Slight height loss with age
    morphedMesh.scale.y *= ageScale;
    morphedMesh.rotation.x = morphs.ageMorph * 0.08; // Forward lean with age
    
    // Gender-specific adjustments for fat distribution
    if (params.sex === 'f') {
      // Female fat distribution tends to be more in hips/thighs
      const femaleHipScale = 1 + (morphs.fatMorph * 0.2);
      morphedMesh.scale.x *= femaleHipScale;
      morphedMesh.scale.z *= femaleHipScale;
    } else {
      // Male fat distribution tends to be more in abdomen
      const maleAbdomenScale = 1 + (morphs.fatMorph * 0.15);
      morphedMesh.scale.x *= maleAbdomenScale;
      morphedMesh.scale.z *= maleAbdomenScale;
    }
    
    return morphedMesh;
  }

  private createWireframeMaterial(): THREE.LineBasicMaterial {
    return new THREE.LineBasicMaterial({
      color: 0xffffff, // White wireframe
      linewidth: 1,
      transparent: false
    });
  }

  async renderAvatar(params: AvatarParams): Promise<Buffer> {
    // Get base mesh
    const baseMesh = params.sex === 'm' ? this.maleMesh : this.femaleMesh;
    if (!baseMesh) {
      throw new Error(`${params.sex === 'm' ? 'Male' : 'Female'} mesh not loaded`);
    }

    // Calculate and apply morphs
    const morphs = this.calculateMorphTargets(params);
    const morphedMesh = this.applyMorphs(baseMesh, morphs, params);

    // Create wireframe geometry
    const wireframeGeometry = new THREE.WireframeGeometry(morphedMesh.geometry);
    const wireframeMaterial = this.createWireframeMaterial();
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

    // Clear scene and add wireframe
    this.scene.clear();
    this.scene.add(wireframe);

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // Extract image data
    const canvas = this.renderer.domElement;
    return (canvas as any).toBuffer('image/png');
  }

  generateFilename(params: AvatarParams): string {
    return `${params.sex}_bf${params.bodyFat}_ffmi${params.ffmi}_age${params.ageRangeIdx}_${params.stature}.png`;
  }

  async renderAllCombinations(): Promise<void> {
    const outputDir = path.join(process.cwd(), 'public', 'avatars');
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const bodyFatValues = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    const ffmiValues = Array.from({ length: 12 }, (_, i) => 14 + i); // 14 to 25
    const ageRangeIndices = [0, 1, 2, 3, 4];
    const sexes: ('m' | 'f')[] = ['m', 'f'];
    const statures: ('s' | 'm' | 't')[] = ['s', 'm', 't'];

    const totalCombinations = bodyFatValues.length * ffmiValues.length * ageRangeIndices.length * sexes.length * statures.length;
    console.log(`Rendering ${totalCombinations} avatar combinations...`);

    let count = 0;
    const startTime = Date.now();

    for (const sex of sexes) {
      for (const bodyFat of bodyFatValues) {
        for (const ffmi of ffmiValues) {
          for (const ageRangeIdx of ageRangeIndices) {
            for (const stature of statures) {
              const params: AvatarParams = { bodyFat, ffmi, ageRangeIdx, sex, stature };
              
              try {
                const imageBuffer = await this.renderAvatar(params);
                const filename = this.generateFilename(params);
                const filepath = path.join(outputDir, filename);
                
                await fs.writeFile(filepath, imageBuffer);
                
                count++;
                if (count % 100 === 0) {
                  const elapsed = (Date.now() - startTime) / 1000;
                  const rate = count / elapsed;
                  const remaining = (totalCombinations - count) / rate;
                  console.log(`Rendered ${count}/${totalCombinations} (${(count/totalCombinations*100).toFixed(1)}%) - ETA: ${Math.round(remaining)}s`);
                }
              } catch (error) {
                console.error(`Error rendering ${this.generateFilename(params)}:`, error);
              }
            }
          }
        }
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Completed rendering ${count} avatars in ${totalTime.toFixed(1)}s`);
  }

  dispose(): void {
    this.renderer.dispose();
    this.scene.clear();
  }
}

// Main execution
async function main() {
  console.log('🎨 Starting avatar pre-rendering...');
  console.log('Target: 3,600 wireframe avatars (10×12×5×2×3 combinations)');
  
  const renderer = new AvatarRenderer();
  
  try {
    await renderer.loadMeshes();
    await renderer.renderAllCombinations();
    console.log('🚀 Avatar pre-rendering completed successfully!');
  } catch (error) {
    console.error('❌ Avatar rendering failed:', error);
    process.exit(1);
  } finally {
    renderer.dispose();
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}