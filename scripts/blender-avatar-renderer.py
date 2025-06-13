"""
Blender Avatar Renderer for LogYourBody
Generates 20 human-like torso avatars based on body fat % and gender

Usage:
blender --background --python scripts/blender-avatar-renderer.py

Requirements:
- Blender 3.0+
- MB-Lab add-on (for realistic human models)
"""

import bpy
import bmesh
import mathutils
import os
import json
from mathutils import Vector

# Avatar parameters
BODY_FAT_VALUES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
GENDERS = ['m', 'f']  # male, female

# Output settings
OUTPUT_DIR = "public/avatars/"
IMAGE_WIDTH = 400
IMAGE_HEIGHT = 400
SAMPLES = 64  # Render quality

def clear_scene():
    """Clear all objects in the scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def setup_scene():
    """Setup basic scene with lighting and camera"""
    clear_scene()
    
    # Add camera
    bpy.ops.object.camera_add(location=(0, -3, 1.2))
    camera = bpy.context.object
    camera.rotation_euler = (1.1, 0, 0)  # Angle down slightly
    
    # Set as active camera
    bpy.context.scene.camera = camera
    
    # Add lighting - 3-point lighting setup
    # Key light
    bpy.ops.object.light_add(type='AREA', location=(2, -2, 3))
    key_light = bpy.context.object
    key_light.data.energy = 10
    key_light.data.size = 2
    
    # Fill light  
    bpy.ops.object.light_add(type='AREA', location=(-1.5, -1, 2))
    fill_light = bpy.context.object
    fill_light.data.energy = 5
    fill_light.data.size = 1.5
    
    # Rim light
    bpy.ops.object.light_add(type='AREA', location=(0, 1, 2))
    rim_light = bpy.context.object
    rim_light.data.energy = 8
    rim_light.data.size = 1
    
    # Set background to dark gray
    world = bpy.context.scene.world
    if world.use_nodes:
        bg_node = world.node_tree.nodes['Background']
        bg_node.inputs[0].default_value = (0.05, 0.05, 0.05, 1.0)  # Dark gray

def create_base_human(gender):
    """Create base human mesh using Blender's built-in human"""
    
    # Add basic human mesh (we'll use a cube and modify it to be human-like)
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 1))
    human = bpy.context.object
    human.name = f"Human_{gender}"
    
    # Enter edit mode and create basic human torso shape
    bpy.context.view_layer.objects.active = human
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Get mesh data
    mesh = bmesh.from_mesh(human.data)
    
    # Clear default cube and create human torso from scratch
    mesh.clear()
    
    # Create torso vertices (basic human torso outline)
    if gender == 'm':
        # Male torso - broader shoulders, narrower hips
        verts = [
            # Shoulders (top)
            (-0.8, 0.2, 1.8), (0.8, 0.2, 1.8),
            (-0.8, -0.2, 1.8), (0.8, -0.2, 1.8),
            
            # Chest
            (-0.7, 0.25, 1.4), (0.7, 0.25, 1.4),
            (-0.7, -0.15, 1.4), (0.7, -0.15, 1.4),
            
            # Waist 
            (-0.5, 0.2, 1.0), (0.5, 0.2, 1.0),
            (-0.5, -0.15, 1.0), (0.5, -0.15, 1.0),
            
            # Hips
            (-0.6, 0.2, 0.6), (0.6, 0.2, 0.6),
            (-0.6, -0.15, 0.6), (0.6, -0.15, 0.6),
            
            # Lower torso
            (-0.5, 0.15, 0.2), (0.5, 0.15, 0.2),
            (-0.5, -0.1, 0.2), (0.5, -0.1, 0.2),
        ]
    else:
        # Female torso - narrower shoulders, wider hips, defined waist
        verts = [
            # Shoulders (top)
            (-0.7, 0.15, 1.8), (0.7, 0.15, 1.8),
            (-0.7, -0.15, 1.8), (0.7, -0.15, 1.8),
            
            # Chest/Bust
            (-0.6, 0.3, 1.4), (0.6, 0.3, 1.4),
            (-0.6, -0.1, 1.4), (0.6, -0.1, 1.4),
            
            # Waist (more defined)
            (-0.4, 0.25, 1.0), (0.4, 0.25, 1.0),
            (-0.4, -0.15, 1.0), (0.4, -0.15, 1.0),
            
            # Hips (wider)
            (-0.7, 0.25, 0.6), (0.7, 0.25, 0.6),
            (-0.7, -0.15, 0.6), (0.7, -0.15, 0.6),
            
            # Lower torso
            (-0.6, 0.2, 0.2), (0.6, 0.2, 0.2),
            (-0.6, -0.1, 0.2), (0.6, -0.1, 0.2),
        ]
    
    # Add vertices
    for v in verts:
        mesh.verts.new(v)
    
    # Create faces (connecting the torso sections)
    mesh.verts.ensure_lookup_table()
    
    # Front and back faces for each section
    for i in range(0, len(verts)-4, 4):
        # Front face
        mesh.faces.new([mesh.verts[i], mesh.verts[i+1], mesh.verts[i+5], mesh.verts[i+4]])
        # Back face  
        mesh.faces.new([mesh.verts[i+2], mesh.verts[i+6], mesh.verts[i+7], mesh.verts[i+3]])
        
        # Side faces
        if i < len(verts)-8:
            # Left side
            mesh.faces.new([mesh.verts[i], mesh.verts[i+4], mesh.verts[i+8], mesh.verts[i+4]])
            # Right side
            mesh.faces.new([mesh.verts[i+1], mesh.verts[i+7], mesh.verts[i+11], mesh.verts[i+5]])
    
    # Update mesh
    bmesh.ops.recalc_face_normals(mesh, faces=mesh.faces)
    mesh.to_mesh(human.data)
    mesh.free()
    
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Add subdivision surface for smoothness
    modifier = human.modifiers.new(name="Subsurface", type='SUBSURF')
    modifier.levels = 2
    
    return human

def apply_body_fat_morph(human, body_fat, gender):
    """Apply body fat morphing to the human mesh"""
    
    # Enter edit mode for morphing
    bpy.context.view_layer.objects.active = human
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Get mesh
    mesh = bmesh.from_mesh(human.data)
    
    # Calculate morph factors
    fat_factor = (body_fat - 5) / 45.0  # Normalize to 0-1
    
    # Apply scaling based on body fat
    for vert in mesh.verts:
        x, y, z = vert.co
        
        # Scale outward for higher body fat
        if gender == 'm':
            # Male fat distribution - more abdominal
            if 0.6 < z < 1.4:  # Torso area
                scale_x = 1.0 + (fat_factor * 0.4)
                scale_y = 1.0 + (fat_factor * 0.6)  # More front/back expansion
                vert.co = (x * scale_x, y * scale_y, z)
        else:
            # Female fat distribution - hips and thighs
            if 0.2 < z < 1.4:  # Torso and hip area
                if z < 0.8:  # Hip area
                    scale_x = 1.0 + (fat_factor * 0.5)
                    scale_y = 1.0 + (fat_factor * 0.4)
                else:  # Upper torso
                    scale_x = 1.0 + (fat_factor * 0.3)
                    scale_y = 1.0 + (fat_factor * 0.4)
                vert.co = (x * scale_x, y * scale_y, z)
    
    # Update mesh
    mesh.to_mesh(human.data)
    mesh.free()
    
    bpy.ops.object.mode_set(mode='OBJECT')

def create_wireframe_material():
    """Create wireframe material for the torso"""
    mat = bpy.data.materials.new(name="WireframeMaterial")
    mat.use_nodes = True
    
    # Clear default nodes
    mat.node_tree.nodes.clear()
    
    # Add wireframe node
    wireframe_node = mat.node_tree.nodes.new(type='ShaderNodeWireframe')
    wireframe_node.use_pixel_size = True
    wireframe_node.inputs[0].default_value = 2.0  # Wire thickness
    
    # Add emission shader
    emission_node = mat.node_tree.nodes.new(type='ShaderNodeEmission')
    emission_node.inputs[0].default_value = (1.0, 1.0, 1.0, 1.0)  # White
    emission_node.inputs[1].default_value = 1.0  # Strength
    
    # Add mix shader
    mix_node = mat.node_tree.nodes.new(type='ShaderNodeMixShader')
    
    # Add transparent shader for non-wireframe areas
    transparent_node = mat.node_tree.nodes.new(type='ShaderNodeBsdfTransparent')
    
    # Add output
    output_node = mat.node_tree.nodes.new(type='ShaderNodeOutputMaterial')
    
    # Connect nodes
    mat.node_tree.links.new(wireframe_node.outputs[0], mix_node.inputs[0])  # Fac
    mat.node_tree.links.new(transparent_node.outputs[0], mix_node.inputs[1])  # Shader1
    mat.node_tree.links.new(emission_node.outputs[0], mix_node.inputs[2])  # Shader2
    mat.node_tree.links.new(mix_node.outputs[0], output_node.inputs[0])  # Surface
    
    # Set material to blend mode
    mat.blend_method = 'BLEND'
    
    return mat

def setup_render_settings():
    """Setup render settings for high-quality output"""
    scene = bpy.context.scene
    
    # Set render engine to Cycles for better quality
    scene.render.engine = 'CYCLES'
    
    # Set output format
    scene.render.filepath = ""
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    
    # Set resolution
    scene.render.resolution_x = IMAGE_WIDTH
    scene.render.resolution_y = IMAGE_HEIGHT
    scene.render.resolution_percentage = 100
    
    # Cycles settings
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    
    # Enable transparent background
    scene.render.film_transparent = True

def render_avatar(gender, body_fat, output_path):
    """Render a single avatar"""
    print(f"Rendering {gender}_bf{body_fat}.png...")
    
    # Setup scene
    setup_scene()
    
    # Create human
    human = create_base_human(gender)
    
    # Apply body fat morphing
    apply_body_fat_morph(human, body_fat, gender)
    
    # Apply wireframe material
    wireframe_mat = create_wireframe_material()
    if human.data.materials:
        human.data.materials[0] = wireframe_mat
    else:
        human.data.materials.append(wireframe_mat)
    
    # Set output path
    bpy.context.scene.render.filepath = output_path
    
    # Render
    bpy.ops.render.render(write_still=True)
    
    print(f"✓ Rendered {gender}_bf{body_fat}.png")

def main():
    """Main rendering function"""
    print("🎨 Starting Blender human avatar rendering...")
    
    # Setup render settings
    setup_render_settings()
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Render all combinations
    total_avatars = len(GENDERS) * len(BODY_FAT_VALUES)
    current = 0
    
    for gender in GENDERS:
        for body_fat in BODY_FAT_VALUES:
            current += 1
            filename = f"{gender}_bf{body_fat}.png"
            output_path = os.path.join(OUTPUT_DIR, filename)
            
            print(f"[{current}/{total_avatars}] Rendering {filename}...")
            
            try:
                render_avatar(gender, body_fat, output_path)
            except Exception as e:
                print(f"❌ Error rendering {filename}: {e}")
                continue
    
    print(f"✅ Completed rendering {total_avatars} human avatars!")
    print(f"📁 Avatars saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()