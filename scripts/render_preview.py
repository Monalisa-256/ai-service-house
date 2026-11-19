import bpy
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'assets/blender/briefing.blend'))
bpy.ops.object.camera_add(location=(4.8,-6.2,3.5));camera=bpy.context.object;direction=Vector((0,0,1.1))-camera.location;camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=6.8;bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='BLENDER_WORKBENCH';scene.display.shading.light='STUDIO';scene.display.shading.color_type='MATERIAL';scene.display.shading.show_shadows=True;scene.render.resolution_x=900;scene.render.resolution_y=580;scene.render.resolution_percentage=100;scene.render.filepath=str(root/'assets/briefing-preview.png');bpy.ops.render.render(write_still=True)
