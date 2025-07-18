#!/usr/bin/env python3
"""
SMPL-X Avatar Generator for LogYourBody
Generates wireframe avatars based on body fat percentage and FFMI

Requirements:
pip install smplx torch pyrender trimesh numpy pillow scikit-learn
"""

import os
import json
import torch
import smplx
import pyrender
import trimesh
import numpy as np
from PIL import Image
from typing import Dict, Tuple, List
from sklearn.linear_model import LinearRegression

# Avatar generation specifications
BODY_FAT_PERCENTAGES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
FFMI_VALUES = [15, 17.5, 20, 22.5, 25]
GENDERS = ['male']  # Only male for now since we only have SMPLX_MALE.npz
OUTPUT_DIR = 'public/avatars-smplx'
AVATAR_MANIFEST_FILE = 'avatar-manifest.json'

# SMPL-X model configuration
SMPLX_MODEL_PATH = './assets/models'  # Path to models directory
SMPLX_CONFIG = {
    'model_type': 'smplx',
    'ext': 'npz',
    'use_pca': False,
    'use_face_contour': False,
    'flat_hand_mean': False,
    'use_hands': False,
    'use_face': False
}

class SMPLXAvatarGenerator:
    def __init__(self, model_path: str):
        """Initialize SMPL-X models for male and female"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load SMPL-X models
        self.models = {}
        for gender in GENDERS:
            self.models[gender] = smplx.create(
                model_path=model_path,
                gender=gender,
                **SMPLX_CONFIG
            ).to(self.device)
        
        # Initialize shape parameter mapping
        self.shape_mapper = self._initialize_shape_mapper()
        
        # Setup renderer
        self.renderer = None
        self._setup_renderer()
    
    def _initialize_shape_mapper(self) -> Dict[str, LinearRegression]:
        """Create linear regression models to map BF% and FFMI to shape parameters"""
        # Sample data for mapping (you can calibrate these based on real data)
        # Shape parameters: 0=overall size, 1=muscle, 2=fat, etc.
        mappers = {}
        
        for gender in GENDERS:
            # Create sample mappings (BF%, FFMI) -> shape params
            if gender == 'male':
                # Male samples: lower BF%, higher FFMI potential
                samples = [
                    # (BF%, FFMI) -> (size, muscle, fat, proportion1, proportion2, ...)
                    (5, 25, [0.5, 2.0, -2.0, 0.2, -0.1, 0.0, 0.0, 0.0, 0.0, 0.0]),
                    (10, 22.5, [0.3, 1.5, -1.0, 0.1, -0.05, 0.0, 0.0, 0.0, 0.0, 0.0]),
                    (15, 20, [0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]),
                    (20, 17.5, [-0.2, -0.5, 1.0, -0.1, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0]),
                    (30, 15, [-0.5, -1.5, 2.0, -0.2, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0]),
                ]
            else:
                # Female samples: typically higher BF%, lower FFMI
                samples = [
                    (15, 22.5, [0.2, 1.5, -1.0, 0.3, -0.1, 0.0, 0.0, 0.0, 0.0, 0.0]),
                    (20, 20, [0.0, 0.5, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]),
                    (25, 17.5, [-0.1, 0.0, 0.5, 0.1, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0]),
                    (30, 15, [-0.3, -0.5, 1.5, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0]),
                    (40, 15, [-0.5, -1.0, 2.5, -0.1, 0.15, 0.0, 0.0, 0.0, 0.0, 0.0]),
                ]
            
            # Extract features and targets
            X = np.array([[s[0], s[1]] for s in samples])  # BF%, FFMI
            y = np.array([s[2] for s in samples])  # Shape params
            
            # Fit linear regression
            mapper = LinearRegression()
            mapper.fit(X, y)
            mappers[gender] = mapper
        
        return mappers
    
    def _setup_renderer(self):
        """Setup pyrender offscreen renderer"""
        # Create scene
        self.scene = pyrender.Scene(ambient_light=[0.5, 0.5, 0.5])
        
        # Add camera
        camera = pyrender.PerspectiveCamera(yfov=np.pi / 3.0)
        camera_pose = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 3.0],
            [0.0, 0.0, 0.0, 1.0]
        ])
        self.scene.add(camera, pose=camera_pose)
        
        # Add directional light
        light = pyrender.DirectionalLight(color=[1.0, 1.0, 1.0], intensity=2.0)
        light_pose = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 1.0],
            [0.0, 0.0, 1.0, 1.0],
            [0.0, 0.0, 0.0, 1.0]
        ])
        self.scene.add(light, pose=light_pose)
        
        # Create offscreen renderer
        self.renderer = pyrender.OffscreenRenderer(512, 640)
    
    def get_shape_params(self, gender: str, bf_percentage: float, ffmi: float) -> torch.Tensor:
        """Convert body fat percentage and FFMI to SMPL-X shape parameters"""
        # Use linear regression to map BF% and FFMI to shape params
        features = np.array([[bf_percentage, ffmi]])
        shape_params = self.shape_mapper[gender].predict(features)[0]
        
        # Convert to torch tensor
        return torch.tensor(shape_params, dtype=torch.float32).unsqueeze(0).to(self.device)
    
    def generate_mesh(self, gender: str, bf_percentage: float, ffmi: float) -> trimesh.Trimesh:
        """Generate SMPL-X mesh for given parameters"""
        # Get shape parameters
        betas = self.get_shape_params(gender, bf_percentage, ffmi)
        
        # Generate SMPL-X output
        model_output = self.models[gender](
            betas=betas,
            body_pose=torch.zeros(1, 63).to(self.device),  # Neutral pose
            global_orient=torch.zeros(1, 3).to(self.device),
            transl=torch.zeros(1, 3).to(self.device)
        )
        
        # Extract vertices and faces
        vertices = model_output.vertices.detach().cpu().numpy()[0]
        faces = self.models[gender].faces
        
        # Create trimesh
        mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
        
        return mesh
    
    def render_wireframe(self, mesh: trimesh.Trimesh, output_path: str):
        """Render mesh as wireframe and save to file"""
        # Clear previous mesh from scene
        for node in list(self.scene.mesh_nodes):
            self.scene.remove_node(node)
        
        # Create wireframe material (light purple on dark background)
        material = pyrender.MetallicRoughnessMaterial(
            baseColorFactor=[0.7, 0.5, 0.9, 1.0],  # Light purple color
            metallicFactor=0.2,
            roughnessFactor=0.8,
            wireframe=True
        )
        
        # Add mesh to scene
        mesh_node = pyrender.Mesh.from_trimesh(mesh, material=material)
        self.scene.add(mesh_node)
        
        # Render
        color, _ = self.renderer.render(self.scene)
        
        # Convert to PIL Image with dark background
        img = Image.fromarray(color)
        
        # Create dark background
        bg = Image.new('RGBA', img.size, (20, 20, 30, 255))  # Dark blue-gray
        
        # Composite wireframe over background
        final_img = Image.alpha_composite(bg, img.convert('RGBA'))
        
        # Save
        final_img.save(output_path, 'PNG')
    
    def generate_all_avatars(self):
        """Generate all avatar combinations"""
        manifest = {'avatars': {}}
        
        for gender in GENDERS:
            gender_dir = os.path.join(OUTPUT_DIR, gender)
            os.makedirs(gender_dir, exist_ok=True)
            manifest['avatars'][gender] = {}
            
            for ffmi in FFMI_VALUES:
                ffmi_dir = os.path.join(gender_dir, f'ffmi{ffmi}'.replace('.', '_'))
                os.makedirs(ffmi_dir, exist_ok=True)
                manifest['avatars'][gender][f'ffmi{ffmi}'] = {}
                
                for bf in BODY_FAT_PERCENTAGES:
                    # Generate filename
                    filename = f'{gender}_ffmi{ffmi}_bf{bf}.png'.replace('.', '_')
                    filepath = os.path.join(ffmi_dir, filename)
                    
                    logger.info(f'Generating {gender} avatar: FFMI={ffmi}, BF={bf}%...')
                    
                    try:
                        # Generate mesh
                        mesh = self.generate_mesh(gender, bf, ffmi)
                        
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
    # Check if SMPL-X models exist
    if not os.path.exists(SMPLX_MODEL_PATH):
        print(f"Error: SMPL-X models not found at {SMPLX_MODEL_PATH}")
        print("Please download SMPL-X models from https://smpl-x.is.tue.mpg.de/")
        print("Extract the models to ./assets/models/smplx/")
        return
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Initialize generator
    print("Initializing SMPL-X avatar generator...")
    generator = SMPLXAvatarGenerator(SMPLX_MODEL_PATH)
    
    try:
        # Generate all avatars
        generator.generate_all_avatars()
    finally:
        # Clean up
        generator.cleanup()


if __name__ == '__main__':
    main()