#!/usr/bin/env python3
"""
Simplified Wireframe Avatar Generator Demo
Generates wireframe body avatars using basic 3D shapes
This is a demo that doesn't require SMPL-X models
"""

import os
import numpy as np
from PIL import Image, ImageDraw
import json
from typing import Tuple

# Configuration
OUTPUT_DIR = 'public/avatars-wireframe-demo'
AVATAR_SIZE = (256, 320)
BODY_FAT_PERCENTAGES = [10, 20, 30, 40]
FFMI_VALUES = [17.5, 20, 22.5]
GENDERS = ['male', 'female']

class WireframeAvatarGenerator:
    def __init__(self):
        self.colors = {
            'wireframe': (179, 128, 230),  # Light purple
            'background': (20, 20, 30),     # Dark blue-gray
        }
    
    def generate_body_shape(self, gender: str, bf_percentage: float, ffmi: float) -> dict:
        """Generate body shape parameters based on inputs"""
        # Base proportions
        if gender == 'male':
            shoulder_width = 1.2 + (ffmi - 20) * 0.02
            waist_width = 0.8 + (bf_percentage - 20) * 0.01
            hip_width = 0.9 + (bf_percentage - 20) * 0.005
            chest_depth = 0.3 + (ffmi - 20) * 0.01
        else:
            shoulder_width = 1.0 + (ffmi - 20) * 0.015
            waist_width = 0.7 + (bf_percentage - 20) * 0.01
            hip_width = 1.0 + (bf_percentage - 20) * 0.01
            chest_depth = 0.25 + (ffmi - 20) * 0.008
        
        # Adjust muscle definition
        muscle_definition = max(0.1, 1.0 - (bf_percentage / 50))
        
        return {
            'shoulder_width': shoulder_width,
            'waist_width': waist_width,
            'hip_width': hip_width,
            'chest_depth': chest_depth,
            'muscle_definition': muscle_definition,
            'body_fat': bf_percentage / 100
        }
    
    def draw_wireframe_body(self, img_draw: ImageDraw, shape_params: dict, center: Tuple[int, int]):
        """Draw a simplified wireframe body"""
        cx, cy = center
        scale = 100  # Base scale factor
        
        # Extract parameters
        sw = shape_params['shoulder_width'] * scale
        ww = shape_params['waist_width'] * scale
        hw = shape_params['hip_width'] * scale
        
        # Define body keypoints
        points = {
            'head_top': (cx, cy - 130),
            'neck': (cx, cy - 100),
            'shoulder_l': (cx - sw/2, cy - 80),
            'shoulder_r': (cx + sw/2, cy - 80),
            'chest': (cx, cy - 50),
            'waist_l': (cx - ww/2, cy),
            'waist_r': (cx + ww/2, cy),
            'hip_l': (cx - hw/2, cy + 30),
            'hip_r': (cx + hw/2, cy + 30),
            'knee_l': (cx - hw/3, cy + 100),
            'knee_r': (cx + hw/3, cy + 100),
            'ankle_l': (cx - hw/4, cy + 150),
            'ankle_r': (cx + hw/4, cy + 150),
        }
        
        # Draw wireframe lines
        wireframe_color = self.colors['wireframe']
        line_width = 2
        
        # Head
        img_draw.ellipse([cx-15, cy-145, cx+15, cy-115], outline=wireframe_color, width=line_width)
        
        # Torso outline
        torso_points = [
            points['shoulder_l'], points['shoulder_r'],
            points['waist_r'], points['hip_r'],
            points['hip_l'], points['waist_l'],
            points['shoulder_l']
        ]
        for i in range(len(torso_points)-1):
            img_draw.line([torso_points[i], torso_points[i+1]], fill=wireframe_color, width=line_width)
        
        # Arms
        # Left arm
        img_draw.line([points['shoulder_l'], (cx - sw/2 - 20, cy - 20)], fill=wireframe_color, width=line_width)
        img_draw.line([(cx - sw/2 - 20, cy - 20), (cx - sw/2 - 10, cy + 30)], fill=wireframe_color, width=line_width)
        
        # Right arm
        img_draw.line([points['shoulder_r'], (cx + sw/2 + 20, cy - 20)], fill=wireframe_color, width=line_width)
        img_draw.line([(cx + sw/2 + 20, cy - 20), (cx + sw/2 + 10, cy + 30)], fill=wireframe_color, width=line_width)
        
        # Legs
        # Left leg
        img_draw.line([points['hip_l'], points['knee_l']], fill=wireframe_color, width=line_width)
        img_draw.line([points['knee_l'], points['ankle_l']], fill=wireframe_color, width=line_width)
        
        # Right leg
        img_draw.line([points['hip_r'], points['knee_r']], fill=wireframe_color, width=line_width)
        img_draw.line([points['knee_r'], points['ankle_r']], fill=wireframe_color, width=line_width)
        
        # Add muscle definition lines based on body fat
        if shape_params['muscle_definition'] > 0.5:
            # Chest line
            img_draw.line([points['chest'], (cx, cy - 30)], fill=wireframe_color, width=1)
            
            # Ab lines
            if shape_params['body_fat'] < 0.15:
                for i in range(3):
                    y = cy - 30 + i * 20
                    img_draw.line([(cx - ww/4, y), (cx + ww/4, y)], fill=wireframe_color, width=1)
    
    def generate_avatar(self, gender: str, bf_percentage: float, ffmi: float) -> Image.Image:
        """Generate a single avatar image"""
        # Create image with background
        img = Image.new('RGB', AVATAR_SIZE, self.colors['background'])
        draw = ImageDraw.Draw(img)
        
        # Get body shape parameters
        shape_params = self.generate_body_shape(gender, bf_percentage, ffmi)
        
        # Draw wireframe body
        center = (AVATAR_SIZE[0] // 2, AVATAR_SIZE[1] // 2)
        self.draw_wireframe_body(draw, shape_params, center)
        
        return img
    
    def generate_all_avatars(self):
        """Generate all avatar combinations"""
        os.makedirs(OUTPUT_DIR, exist_ok=True)
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
                    filename = f'{gender}_ffmi{str(ffmi).replace(".", "_")}_bf{bf}.png'
                    filepath = os.path.join(ffmi_dir, filename)
                    
                    print(f'Generating {gender} avatar: FFMI={ffmi}, BF={bf}%...')
                    
                    # Generate and save avatar
                    avatar = self.generate_avatar(gender, bf, ffmi)
                    avatar.save(filepath, 'PNG')
                    
                    # Update manifest
                    manifest['avatars'][gender][f'ffmi{ffmi}'][f'bf{bf}'] = filepath
        
        # Save manifest
        manifest_path = os.path.join(OUTPUT_DIR, 'avatar-manifest.json')
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print(f'Demo avatars generated! Check {OUTPUT_DIR}')
        print('Note: These are simplified wireframes. For realistic avatars, use the SMPL-X version.')


def main():
    generator = WireframeAvatarGenerator()
    generator.generate_all_avatars()


if __name__ == '__main__':
    main()