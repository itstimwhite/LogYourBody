#!/usr/bin/env python3
"""
SMPL Avatar Generator for LogYourBody (Simplified version)
Generates avatars using basic mesh manipulation without full SMPL-X

Requirements:
pip install torch trimesh numpy pillow scikit-learn pyrender
"""

import os
import json
import numpy as np
import trimesh
from PIL import Image
import pyrender
from typing import Dict, Tuple, List

# Avatar generation specifications
BODY_FAT_PERCENTAGES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
FFMI_VALUES = [15, 17.5, 20, 22.5, 25]
GENDERS = ['male', 'female']
OUTPUT_DIR = 'public/avatars-smpl'
AVATAR_MANIFEST_FILE = 'avatar-manifest.json'

class SimplifiedAvatarGenerator:
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
            [0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 2.5],
            [0.0, 0.0, 0.0, 1.0]
        ])
        self.scene.add(camera, pose=camera_pose)
        
        # Add directional light
        light = pyrender.DirectionalLight(color=[1.0, 1.0, 1.0], intensity=3.0)
        light_pose = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 1.0],
            [0.0, 0.0, 1.0, 1.0],
            [0.0, 0.0, 0.0, 1.0]
        ])
        self.scene.add(light, pose=light_pose)
        
        # Create offscreen renderer
        self.renderer = pyrender.OffscreenRenderer(512, 640, point_size=1.0)
    
    def create_body_mesh(self, gender: str, bf_percentage: float, ffmi: float) -> trimesh.Trimesh:
        """Create a simplified body mesh based on parameters"""
        # Create base cylindrical body parts
        
        # Body proportions based on gender and metrics
        if gender == 'male':
            shoulder_width = 0.4 + (ffmi - 20) * 0.02
            waist_width = 0.3 + (bf_percentage - 20) * 0.015
            hip_width = 0.35 + (bf_percentage - 20) * 0.01
            chest_depth = 0.25 + (ffmi - 20) * 0.01
        else:
            shoulder_width = 0.35 + (ffmi - 20) * 0.015
            waist_width = 0.25 + (bf_percentage - 20) * 0.01
            hip_width = 0.4 + (bf_percentage - 20) * 0.015
            chest_depth = 0.2 + (ffmi - 20) * 0.008
        
        # Create body parts
        meshes = []
        
        # Head (sphere)
        head = trimesh.creation.uv_sphere(radius=0.12, count=[16, 16])
        head.apply_translation([0, 1.6, 0])
        meshes.append(head)
        
        # Neck (cylinder)
        neck = trimesh.creation.cylinder(radius=0.05, height=0.1, sections=12)
        neck.apply_translation([0, 1.45, 0])
        meshes.append(neck)
        
        # Torso (tapered cylinder)
        torso_vertices = []
        torso_faces = []
        segments = 20
        height_segments = 10
        
        for i in range(height_segments + 1):
            y = 1.4 - (i / height_segments) * 0.8
            t = i / height_segments
            
            # Interpolate widths
            if t < 0.3:  # Shoulders to chest
                width_x = shoulder_width * (1 - t/0.3) + chest_depth * (t/0.3)
                width_z = chest_depth
            elif t < 0.7:  # Chest to waist
                local_t = (t - 0.3) / 0.4
                width_x = chest_depth * (1 - local_t) + waist_width * local_t
                width_z = chest_depth * (1 - local_t) + waist_width * local_t
            else:  # Waist to hips
                local_t = (t - 0.7) / 0.3
                width_x = waist_width * (1 - local_t) + hip_width * local_t
                width_z = waist_width * (1 - local_t) + hip_width * local_t
            
            for j in range(segments):
                angle = (j / segments) * 2 * np.pi
                x = np.cos(angle) * width_x
                z = np.sin(angle) * width_z
                torso_vertices.append([x, y, z])
        
        # Create faces
        for i in range(height_segments):
            for j in range(segments):
                v1 = i * segments + j
                v2 = i * segments + (j + 1) % segments
                v3 = (i + 1) * segments + (j + 1) % segments
                v4 = (i + 1) * segments + j
                
                torso_faces.append([v1, v2, v3])
                torso_faces.append([v1, v3, v4])
        
        torso = trimesh.Trimesh(vertices=torso_vertices, faces=torso_faces)
        meshes.append(torso)
        
        # Arms (cylinders)
        arm_radius = 0.04 + (ffmi - 20) * 0.005
        for side in [-1, 1]:
            # Upper arm
            upper_arm = trimesh.creation.cylinder(radius=arm_radius, height=0.3, sections=8)
            upper_arm.apply_transform(trimesh.transformations.rotation_matrix(np.pi/6 * side, [0, 0, 1]))
            upper_arm.apply_translation([side * shoulder_width, 1.25, 0])
            meshes.append(upper_arm)
            
            # Lower arm
            lower_arm = trimesh.creation.cylinder(radius=arm_radius * 0.8, height=0.3, sections=8)
            lower_arm.apply_transform(trimesh.transformations.rotation_matrix(np.pi/6 * side, [0, 0, 1]))
            lower_arm.apply_translation([side * (shoulder_width + 0.15), 0.95, 0])
            meshes.append(lower_arm)
        
        # Legs (cylinders)
        leg_radius = 0.06 + (ffmi - 20) * 0.005
        for side in [-1, 1]:
            # Upper leg
            upper_leg = trimesh.creation.cylinder(radius=leg_radius, height=0.4, sections=8)
            upper_leg.apply_translation([side * hip_width * 0.5, 0.4, 0])
            meshes.append(upper_leg)
            
            # Lower leg
            lower_leg = trimesh.creation.cylinder(radius=leg_radius * 0.7, height=0.4, sections=8)
            lower_leg.apply_translation([side * hip_width * 0.5, 0, 0])
            meshes.append(lower_leg)
        
        # Combine all meshes
        combined = trimesh.util.concatenate(meshes)
        
        # Apply smoothing
        combined = combined.smoothed()
        
        return combined
    
    def render_wireframe(self, mesh: trimesh.Trimesh, output_path: str):
        """Render mesh as wireframe and save to file"""
        # Clear previous mesh from scene
        for node in list(self.scene.mesh_nodes):
            self.scene.remove_node(node)
        
        # Create wireframe material
        material = pyrender.MetallicRoughnessMaterial(
            baseColorFactor=[0.7, 0.5, 0.9, 1.0],  # Light purple
            metallicFactor=0.0,
            roughnessFactor=1.0,
            wireframe=True
        )
        
        # Add mesh to scene
        mesh_node = pyrender.Mesh.from_trimesh(mesh, material=material)
        self.scene.add(mesh_node)
        
        # Render
        color, _ = self.renderer.render(self.scene, flags=pyrender.RenderFlags.RGBA)
        
        # Create background
        img = Image.fromarray(color)
        
        # Save
        img.save(output_path, 'PNG')
    
    def generate_all_avatars(self):
        """Generate all avatar combinations"""
        manifest = {'avatars': {}}
        
        for gender in GENDERS:
            gender_dir = os.path.join(OUTPUT_DIR, gender)
            os.makedirs(gender_dir, exist_ok=True)
            manifest['avatars'][gender] = {}
            
            for ffmi in FFMI_VALUES:
                ffmi_dir = os.path.join(gender_dir, f'ffmi{str(ffmi).replace(".", "_")}')
                os.makedirs(ffmi_dir, exist_ok=True)
                manifest['avatars'][gender][f'ffmi{ffmi}'] = {}
                
                for bf in BODY_FAT_PERCENTAGES:
                    # Generate filename
                    filename = f'{gender}_ffmi{str(ffmi).replace(".", "_")}_bf{bf}.png'
                    filepath = os.path.join(ffmi_dir, filename)
                    
                    print(f'Generating {gender} avatar: FFMI={ffmi}, BF={bf}%...')
                    
                    try:
                        # Generate mesh
                        mesh = self.create_body_mesh(gender, bf, ffmi)
                        
                        # Render and save
                        self.render_wireframe(mesh, filepath)
                        
                        # Update manifest
                        manifest['avatars'][gender][f'ffmi{ffmi}'][f'bf{bf}'] = filepath
                        
                    except Exception as e:
                        print(f'Error generating avatar: {e}')
                        continue
        
        # Save manifest
        manifest_path = os.path.join(OUTPUT_DIR, AVATAR_MANIFEST_FILE)
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print(f'Avatar generation complete! Manifest saved to {manifest_path}')
    
    def cleanup(self):
        """Clean up renderer resources"""
        if self.renderer:
            self.renderer.delete()


def main():
    """Main execution function"""
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Initialize generator
    print("Initializing simplified avatar generator...")
    generator = SimplifiedAvatarGenerator()
    
    try:
        # Generate all avatars
        generator.generate_all_avatars()
    finally:
        # Clean up
        generator.cleanup()


if __name__ == '__main__':
    main()