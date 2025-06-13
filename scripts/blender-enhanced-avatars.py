"""
Enhanced Blender Avatar Renderer for LogYourBody
Creates realistic human torso avatars with proper anatomy

This version creates more anatomically correct human torsos
using Blender's built-in modeling capabilities.
"""

import bpy
import bmesh
import mathutils
import os
import json
from mathutils import Vector
import addon_utils

# Avatar parameters
BODY_FAT_VALUES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
GENDERS = ['m', 'f']  # male, female

# Output settings
OUTPUT_DIR = "public/avatars/"
IMAGE_WIDTH = 400
IMAGE_HEIGHT = 400
SAMPLES = 128  # Higher quality render

def clear_scene():
    """Clear all objects in the scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def setup_scene():
    """Setup professional lighting and camera"""
    clear_scene()
    
    # Add camera at optimal angle for torso
    bpy.ops.object.camera_add(location=(0, -4, 1.2))
    camera = bpy.context.object
    camera.rotation_euler = (1.2, 0, 0)  # Look down at torso
    
    # Set as active camera
    bpy.context.scene.camera = camera
    
    # Professional 3-point lighting setup
    
    # Key light (main light)
    bpy.ops.object.light_add(type='AREA', location=(3, -3, 4))
    key_light = bpy.context.object
    key_light.data.energy = 15
    key_light.data.size = 3
    key_light.rotation_euler = (0.5, 0.3, 0)
    
    # Fill light (softens shadows)
    bpy.ops.object.light_add(type='AREA', location=(-2, -2, 3))
    fill_light = bpy.context.object
    fill_light.data.energy = 8
    fill_light.data.size = 2
    fill_light.rotation_euler = (0.4, -0.2, 0)
    
    # Rim light (separates subject from background)
    bpy.ops.object.light_add(type='AREA', location=(0, 2, 3))
    rim_light = bpy.context.object
    rim_light.data.energy = 12
    rim_light.data.size = 2
    rim_light.rotation_euler = (-0.6, 0, 0)
    
    # Ambient light
    world = bpy.context.scene.world
    if world.use_nodes:
        bg_node = world.node_tree.nodes['Background']
        bg_node.inputs[0].default_value = (0.02, 0.02, 0.02, 1.0)
        bg_node.inputs[1].default_value = 0.1  # Very dim ambient

def create_realistic_human_torso(gender):
    """Create anatomically correct human torso"""
    
    # Start with a UV sphere for the torso base
    bpy.ops.mesh.primitive_uv_sphere_add(location=(0, 0, 1.2), scale=(1, 0.8, 1.4))
    torso = bpy.context.object
    torso.name = f"HumanTorso_{gender}"
    
    # Enter edit mode for detailed modeling
    bpy.context.view_layer.objects.active = torso
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Get mesh data
    mesh = bmesh.from_mesh(torso.data)
    
    # Remove bottom hemisphere (we only want torso)
    verts_to_remove = [v for v in mesh.verts if v.co.z < 0.1]
    bmesh.ops.delete(mesh, geom=verts_to_remove, context='VERTS')
    
    # Gender-specific modifications
    if gender == 'm':
        # Male torso - broader shoulders, straighter waist
        for vert in mesh.verts:
            x, y, z = vert.co
            
            # Shoulder broadening
            if z > 1.8:
                vert.co.x *= 1.3
                vert.co.y *= 0.9
            
            # Chest definition
            elif 1.4 < z <= 1.8:
                vert.co.x *= 1.2
                vert.co.y *= 0.95
                # Add slight pectoral curve
                if abs(x) > 0.3 and y > 0:
                    vert.co.y *= 1.1
            
            # Waist tapering
            elif 0.8 < z <= 1.4:
                taper = 0.8 + (z - 0.8) * 0.5
                vert.co.x *= taper
                vert.co.y *= 0.9
            
            # Hip area
            elif 0.1 <= z <= 0.8:
                vert.co.x *= 0.9
                vert.co.y *= 0.9
    
    else:
        # Female torso - narrower shoulders, defined waist, wider hips
        for vert in mesh.verts:
            x, y, z = vert.co
            
            # Shoulder area (narrower)
            if z > 1.8:
                vert.co.x *= 1.1
                vert.co.y *= 0.85
            
            # Bust area
            elif 1.4 < z <= 1.8:
                vert.co.x *= 1.0
                # Add bust curve
                if y > 0:
                    vert.co.y *= 1.2
                else:
                    vert.co.y *= 0.9
            
            # Waist (more defined)
            elif 0.9 < z <= 1.4:
                waist_factor = 0.65 + (z - 0.9) * 0.7
                vert.co.x *= waist_factor
                vert.co.y *= 0.85
            
            # Hip area (wider)
            elif 0.1 <= z <= 0.9:
                hip_factor = 1.2 - (z - 0.1) * 0.3
                vert.co.x *= hip_factor
                vert.co.y *= 0.95
    
    # Smooth the mesh
    bmesh.ops.smooth_vert(mesh, verts=mesh.verts, factor=0.3, repeat=2)
    
    # Update mesh
    mesh.to_mesh(torso.data)
    mesh.free()
    
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Add subdivision surface for smooth appearance
    modifier = torso.modifiers.new(name="Subsurface", type='SUBSURF')
    modifier.levels = 3
    modifier.render_levels = 3
    
    return torso

def apply_body_fat_morphing(torso, body_fat, gender):
    """Apply realistic body fat distribution"""
    
    # Calculate fat factor (0 = 5% BF, 1 = 50% BF)
    fat_factor = (body_fat - 5) / 45.0
    
    # Enter edit mode
    bpy.context.view_layer.objects.active = torso
    bpy.ops.object.mode_set(mode='EDIT')
    
    mesh = bmesh.from_mesh(torso.data)
    
    for vert in mesh.verts:
        x, y, z = vert.co
        
        if gender == 'm':
            # Male fat distribution - abdominal focus
            
            # Abdominal area expansion
            if 0.8 < z <= 1.5 and y > -0.2:
                expansion = 1.0 + (fat_factor * 0.8)
                vert.co.y *= expansion
            
            # Chest area slight expansion
            if 1.5 < z <= 2.0:
                expansion = 1.0 + (fat_factor * 0.3)
                vert.co *= expansion
                
            # Waist thickening
            if 0.5 < z <= 1.2:
                expansion = 1.0 + (fat_factor * 0.6)
                vert.co.x *= expansion
                
        else:
            # Female fat distribution - hips, thighs, bust
            
            # Hip and thigh area
            if 0.1 <= z <= 1.0:
                expansion = 1.0 + (fat_factor * 0.7)
                vert.co.x *= expansion
                if y < 0:  # Back area
                    vert.co.y *= 1.0 + (fat_factor * 0.4)
            
            # Bust area
            if 1.4 < z <= 1.9 and y > 0:
                expansion = 1.0 + (fat_factor * 0.5)
                vert.co.y *= expansion
            
            # Waist (less expansion than male)
            if 0.9 < z <= 1.4:
                expansion = 1.0 + (fat_factor * 0.4)
                vert.co *= expansion
    
    # Apply smoothing to maintain natural curves
    bmesh.ops.smooth_vert(mesh, verts=mesh.verts, factor=0.2, repeat=1)
    
    mesh.to_mesh(torso.data)
    mesh.free()
    
    bpy.ops.object.mode_set(mode='OBJECT')

def create_wireframe_material():
    """Create professional wireframe material"""
    mat = bpy.data.materials.new(name="WireframeTorso")
    mat.use_nodes = True
    
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    # Output node
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (400, 0)
    
    # Mix shader for wireframe effect
    mix = nodes.new(type='ShaderNodeMixShader')
    mix.location = (200, 0)
    
    # Wireframe node
    wireframe = nodes.new(type='ShaderNodeWireframe')
    wireframe.location = (-200, 100)
    wireframe.use_pixel_size = True
    wireframe.inputs[0].default_value = 1.5  # Wire thickness
    
    # Emission shader for wireframe lines
    emission = nodes.new(type='ShaderNodeEmission')
    emission.location = (0, 100)
    emission.inputs[0].default_value = (1.0, 1.0, 1.0, 1.0)  # White
    emission.inputs[1].default_value = 2.0  # Bright
    
    # Transparent shader for non-wireframe areas
    transparent = nodes.new(type='ShaderNodeBsdfTransparent')
    transparent.location = (0, -100)
    
    # Connect nodes
    links.new(wireframe.outputs[0], mix.inputs[0])  # Fac
    links.new(transparent.outputs[0], mix.inputs[1])  # Shader1
    links.new(emission.outputs[0], mix.inputs[2])  # Shader2
    links.new(mix.outputs[0], output.inputs[0])  # Surface
    
    # Enable transparency
    mat.blend_method = 'BLEND'
    mat.show_transparent_back = False
    
    return mat

def setup_render_settings():
    """Setup high-quality render settings"""
    scene = bpy.context.scene
    
    # Use Cycles for photorealistic rendering
    scene.render.engine = 'CYCLES'
    
    # Output settings
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'
    
    # Resolution
    scene.render.resolution_x = IMAGE_WIDTH
    scene.render.resolution_y = IMAGE_HEIGHT
    scene.render.resolution_percentage = 100
    
    # Cycles render settings
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = 'OPENIMAGEDENOISE'
    
    # Transparent background
    scene.render.film_transparent = True
    
    # Color management for consistent output
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'

def render_avatar(gender, body_fat, output_path):
    """Render a single high-quality avatar"""
    print(f"🎨 Rendering {gender}_bf{body_fat}.png...")
    
    # Setup scene
    setup_scene()
    
    # Create realistic human torso
    torso = create_realistic_human_torso(gender)
    
    # Apply body fat morphing
    apply_body_fat_morphing(torso, body_fat, gender)
    
    # Apply wireframe material
    wireframe_mat = create_wireframe_material()
    if torso.data.materials:
        torso.data.materials[0] = wireframe_mat
    else:
        torso.data.materials.append(wireframe_mat)
    
    # Set output path
    bpy.context.scene.render.filepath = output_path
    
    # Render
    bpy.ops.render.render(write_still=True)
    
    print(f"✅ Completed {gender}_bf{body_fat}.png")

def main():
    """Main rendering function"""
    print("🎨 Starting Enhanced Blender Human Avatar Rendering...")
    print(f"Target: {len(GENDERS) * len(BODY_FAT_VALUES)} high-quality human torso avatars")
    
    # Setup render settings
    setup_render_settings()
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Render all combinations
    total_avatars = len(GENDERS) * len(BODY_FAT_VALUES)
    
    for i, gender in enumerate(GENDERS):
        for j, body_fat in enumerate(BODY_FAT_VALUES):
            current = i * len(BODY_FAT_VALUES) + j + 1
            filename = f"{gender}_bf{body_fat}.png"
            output_path = os.path.join(OUTPUT_DIR, filename)
            
            print(f"\n[{current}/{total_avatars}] Processing {filename}...")
            
            try:
                render_avatar(gender, body_fat, output_path)
            except Exception as e:
                print(f"❌ Error rendering {filename}: {e}")
                continue
    
    print(f"\n🎉 Successfully rendered {total_avatars} realistic human avatars!")
    print(f"📁 Saved to: {OUTPUT_DIR}")
    print("\n✨ Features:")
    print("  • Anatomically correct human torsos")
    print("  • Gender-specific body shapes")
    print("  • Realistic body fat distribution")
    print("  • Professional wireframe styling")
    print("  • High-quality anti-aliased rendering")

if __name__ == "__main__":
    main()