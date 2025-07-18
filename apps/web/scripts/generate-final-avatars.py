#!/usr/bin/env python3
"""
Final Avatar Generator for LogYourBody
Generates all avatar assets needed for the app based on body composition
"""

import os
import json
import numpy as np
import trimesh
from PIL import Image
import pyrender

# Avatar specifications matching the existing system
BODY_FAT_PERCENTAGES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
GENDERS = ['male', 'female']
OUTPUT_DIR = 'public/avatars-v2'  # New directory for updated avatars

class AvatarGenerator:
    def __init__(self):
        """Initialize the avatar generator"""
        self.renderer = None
        self._setup_renderer()
    
    def _setup_renderer(self):
        """Setup pyrender offscreen renderer"""
        # Create scene
        self.scene = pyrender.Scene(ambient_light=[0.3, 0.3, 0.3])
        
        # Add camera
        camera = pyrender.PerspectiveCamera(yfov=np.pi / 3.0)
        camera_pose = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.1],
            [0.0, 0.0, 1.0, 2.2],
            [0.0, 0.0, 0.0, 1.0]
        ])
        self.scene.add(camera, pose=camera_pose)
        
        # Add lights
        light1 = pyrender.DirectionalLight(color=[1.0, 1.0, 1.0], intensity=2.0)
        light1_pose = np.array([
            [1.0, 0.0, 0.0, 1.0],
            [0.0, 1.0, 0.0, 1.0],
            [0.0, 0.0, 1.0, 1.0],
            [0.0, 0.0, 0.0, 1.0]
        ])
        self.scene.add(light1, pose=light1_pose)
        
        # Add fill light
        light2 = pyrender.DirectionalLight(color=[0.8, 0.8, 0.8], intensity=1.0)
        light2_pose = np.array([
            [-1.0, 0.0, 0.0, -1.0],
            [0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, -1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ])
        self.scene.add(light2, pose=light2_pose)
        
        # Create offscreen renderer
        self.renderer = pyrender.OffscreenRenderer(400, 500, point_size=1.0)
    
    def create_body_mesh(self, gender: str, bf_percentage: float) -> trimesh.Trimesh:
        """Create a body mesh based on gender and body fat percentage"""
        
        # Map body fat to FFMI estimates for consistent body shapes
        if gender == 'male':
            # Males typically have lower body fat, higher FFMI
            base_ffmi = 20 - (bf_percentage - 20) * 0.15  # Higher BF% = lower FFMI
            shoulder_width = 0.42 + (base_ffmi - 20) * 0.02
            waist_width = 0.28 + (bf_percentage - 20) * 0.02
            hip_width = 0.32 + (bf_percentage - 20) * 0.015
            chest_depth = 0.28 + (base_ffmi - 20) * 0.015
        else:
            # Females typically have higher body fat, lower FFMI
            base_ffmi = 18 - (bf_percentage - 25) * 0.1
            shoulder_width = 0.36 + (base_ffmi - 18) * 0.015
            waist_width = 0.24 + (bf_percentage - 25) * 0.015
            hip_width = 0.38 + (bf_percentage - 25) * 0.02
            chest_depth = 0.22 + (base_ffmi - 18) * 0.01
        
        # Muscle definition based on body fat
        muscle_definition = max(0.1, 1.0 - (bf_percentage / 50))
        
        # Create body parts
        meshes = []
        
        # Head (sphere)
        head = trimesh.creation.uv_sphere(radius=0.11, count=[16, 16])
        head.apply_translation([0, 1.65, 0])
        meshes.append(head)
        
        # Neck (cylinder)
        neck = trimesh.creation.cylinder(radius=0.05, height=0.08, sections=12)
        neck.apply_translation([0, 1.52, 0])
        meshes.append(neck)
        
        # Create torso with proper body shape
        torso_vertices = []
        segments = 24
        height_segments = 20
        
        for i in range(height_segments + 1):
            y = 1.48 - (i / height_segments) * 0.9
            t = i / height_segments
            
            # Shape the torso based on body composition
            if t < 0.15:  # Shoulders
                width_x = shoulder_width
                width_z = chest_depth * 0.8
            elif t < 0.35:  # Chest
                local_t = (t - 0.15) / 0.2
                width_x = shoulder_width * (1 - local_t * 0.1) + chest_depth * local_t
                width_z = chest_depth
            elif t < 0.65:  # Waist
                local_t = (t - 0.35) / 0.3
                width_x = chest_depth * (1 - local_t) + waist_width * local_t
                width_z = chest_depth * (1 - local_t) + waist_width * local_t
            else:  # Hips
                local_t = (t - 0.65) / 0.35
                width_x = waist_width * (1 - local_t) + hip_width * local_t
                width_z = waist_width * (1 - local_t) + hip_width * 0.9 * local_t
            
            # Add body fat distribution
            fat_factor = 1 + (bf_percentage - 20) * 0.005
            width_x *= fat_factor
            width_z *= fat_factor
            
            for j in range(segments):
                angle = (j / segments) * 2 * np.pi
                x = np.cos(angle) * width_x
                z = np.sin(angle) * width_z
                torso_vertices.append([x, y, z])
        
        # Create faces
        torso_faces = []
        for i in range(height_segments):
            for j in range(segments):
                v1 = i * segments + j
                v2 = i * segments + (j + 1) % segments
                v3 = (i + 1) * segments + (j + 1) % segments
                v4 = (i + 1) * segments + j
                
                torso_faces.append([v1, v2, v3])
                torso_faces.append([v1, v3, v4])
        
        torso = trimesh.Trimesh(vertices=torso_vertices, faces=torso_faces)
        torso.fix_normals()
        meshes.append(torso)
        
        # Arms
        arm_radius = 0.04 + (20 - bf_percentage) * 0.0005
        for side in [-1, 1]:
            # Upper arm
            upper_arm = trimesh.creation.cylinder(radius=arm_radius * 1.2, height=0.32, sections=12)
            upper_arm.apply_transform(trimesh.transformations.rotation_matrix(np.pi/8 * side, [0, 0, 1]))
            upper_arm.apply_translation([side * (shoulder_width - 0.05), 1.25, 0])
            meshes.append(upper_arm)
            
            # Lower arm
            lower_arm = trimesh.creation.cylinder(radius=arm_radius, height=0.28, sections=12)
            lower_arm.apply_transform(trimesh.transformations.rotation_matrix(np.pi/8 * side, [0, 0, 1]))
            lower_arm.apply_translation([side * (shoulder_width + 0.12), 0.98, 0])
            meshes.append(lower_arm)
            
            # Hand (small sphere)
            hand = trimesh.creation.uv_sphere(radius=0.035, count=[8, 8])
            hand.apply_translation([side * (shoulder_width + 0.2), 0.82, 0])
            meshes.append(hand)
        
        # Legs
        leg_radius = 0.065 + (20 - bf_percentage) * 0.0008
        for side in [-1, 1]:
            # Upper leg
            upper_leg = trimesh.creation.cylinder(radius=leg_radius * 1.3, height=0.42, sections=12)
            upper_leg.apply_translation([side * hip_width * 0.45, 0.37, 0])
            meshes.append(upper_leg)
            
            # Lower leg
            lower_leg = trimesh.creation.cylinder(radius=leg_radius * 0.9, height=0.38, sections=12)
            lower_leg.apply_translation([side * hip_width * 0.45, -0.03, 0])
            meshes.append(lower_leg)
            
            # Foot
            foot = trimesh.creation.box(extents=[0.08, 0.05, 0.2])
            foot.apply_translation([side * hip_width * 0.45, -0.25, 0.05])
            meshes.append(foot)
        
        # Combine all meshes
        combined = trimesh.util.concatenate(meshes)
        
        # Smooth the mesh
        combined = trimesh.smoothing.filter_laplacian(combined, iterations=2)
        
        return combined
    
    def render_avatar(self, mesh: trimesh.Trimesh, output_path: str):
        """Render mesh as a clean avatar"""
        # Clear previous mesh from scene
        for node in list(self.scene.mesh_nodes):
            self.scene.remove_node(node)
        
        # Create material with purple gradient
        material = pyrender.MetallicRoughnessMaterial(
            baseColorFactor=[0.8, 0.7, 0.9, 1.0],  # Light purple
            metallicFactor=0.1,
            roughnessFactor=0.7
        )
        
        # Add mesh to scene
        mesh_node = pyrender.Mesh.from_trimesh(mesh, material=material)
        self.scene.add(mesh_node)
        
        # Render
        color, _ = self.renderer.render(self.scene, flags=pyrender.RenderFlags.RGBA)
        
        # Create image with transparent background
        img = Image.fromarray(color)
        
        # Make background transparent (assuming it's mostly black)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Make dark pixels transparent
            if item[0] < 30 and item[1] < 30 and item[2] < 30:
                newData.append((0, 0, 0, 0))
            else:
                newData.append(item)
        
        img.putdata(newData)
        
        # Save as PNG
        img.save(output_path, 'PNG')
    
    def generate_all_avatars(self):
        """Generate all avatar combinations"""
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Track generated files for manifest
        generated_files = []
        
        for gender in GENDERS:
            for bf in BODY_FAT_PERCENTAGES:
                # Generate filename matching existing pattern
                filename = f'{gender[0]}_bf{bf}.png'
                filepath = os.path.join(OUTPUT_DIR, filename)
                
                logger.info(f'Generating {gender} avatar: BF={bf}%...')
                
                try:
                    # Generate mesh
                    mesh = self.create_body_mesh(gender, bf)
                    
                    # Render and save
                    self.render_avatar(mesh, filepath)
                    
                    generated_files.append({
                        'gender': gender,
                        'body_fat': bf,
                        'filename': filename,
                        'path': filepath
                    })
                    
                except Exception as e:
                    print(f'Error generating avatar: {e}')
                    continue
        
        # Create a simple manifest
        manifest = {
            'total': len(generated_files),
            'body_fat_percentages': BODY_FAT_PERCENTAGES,
            'genders': GENDERS,
            'files': generated_files
        }
        
        manifest_path = os.path.join(OUTPUT_DIR, 'manifest.json')
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print(f'\nAvatar generation complete!')
        print(f'Generated {len(generated_files)} avatars in {OUTPUT_DIR}')
        print(f'Manifest saved to {manifest_path}')
    
    def cleanup(self):
        """Clean up renderer resources"""
        if self.renderer:
            self.renderer.delete()


def main():
    """Main execution function"""
    print("Generating final avatars for LogYourBody...")
    print("=" * 50)
    
    generator = AvatarGenerator()
    
    try:
        generator.generate_all_avatars()
    finally:
        generator.cleanup()
    
    print("\nNext steps:")
    print("1. Review the generated avatars in public/avatars-v2/")
    print("2. If satisfied, replace the existing avatars in public/avatars/")
    print("3. The app will automatically use the new avatars")


if __name__ == '__main__':
    main()