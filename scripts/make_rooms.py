"""Generate editable Blender masters and compact glTF room prototypes (Blender 4.3)."""
import bpy, math
from mathutils import Vector
from pathlib import Path
bpy.context.preferences.filepaths.save_version = 0
ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / 'assets' / 'blender'
OUT = ROOT / 'public' / 'models'
MASTER.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)

def mat(name, color, roughness=0.82):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*color,1); bs.inputs['Roughness'].default_value=roughness
    return m

def cube(name, loc, scale, material, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o=bpy.context.object; o.name=name
    o.dimensions=scale; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    if bevel:
        mod=o.modifiers.new('Soft edges','BEVEL'); mod.width=bevel; mod.segments=2
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def cylinder(name, loc, radius, depth, material, vertices=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(material);return o

def clear():
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for block in bpy.data.actions: bpy.data.actions.remove(block)

def action_for(obj, name, keys):
    action=bpy.data.actions.new(name=f'{name}::{obj.name}')
    if not obj.animation_data: obj.animation_data_create()
    obj.animation_data.action=action
    for frame, values in keys:
        for bone_name, euler in values.items():
            bone=obj.pose.bones[bone_name];bone.rotation_mode='XYZ';bone.rotation_euler=euler
            bone.keyframe_insert(data_path='rotation_euler',frame=frame,group=bone_name)
    obj.animation_data.action=None
    track=obj.animation_data.nla_tracks.new();track.name=name
    strip=track.strips.new(name,1,action);strip.action_frame_start=1;strip.action_frame_end=41

def object_action(obj,name,locations):
    base=obj.location.copy(); action=bpy.data.actions.new(name=f'{name}::{obj.name}')
    obj.animation_data_create();obj.animation_data.action=action
    for frame, delta in locations:
        obj.location=base+Vector(delta);obj.keyframe_insert(data_path='location',frame=frame)
    obj.location=base;obj.animation_data.action=None
    track=obj.animation_data.nla_tracks.new();track.name=name
    strip=track.strips.new(name,1,action);strip.action_frame_start=1;strip.action_frame_end=41

def human(cloth, skin, hair, ink, paper):
    arm=bpy.data.armatures.new('HumanArmature'); rig=bpy.data.objects.new('ServiceWorkerRig',arm);bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
    def bone(name,head,tail,parent=None):
        b=arm.edit_bones.new(name);b.head=head;b.tail=tail
        if parent:b.parent=arm.edit_bones[parent]
    bone('hips',(-1.52,.95,1.04),(-1.52,.95,1.23))
    bone('spine',(-1.52,.95,1.23),(-1.52,.95,1.77),'hips')
    bone('head',(-1.52,.95,1.77),(-1.52,.95,2.06),'spine')
    bone('arm.L',(-1.32,.95,1.68),(-1.08,.72,1.28),'spine')
    bone('arm.R',(-1.72,.95,1.68),(-1.93,.70,1.28),'spine')
    bone('leg.L',(-1.40,.95,1.10),(-1.40,.95,.16),'hips')
    bone('leg.R',(-1.64,.95,1.10),(-1.64,.95,.16),'hips')
    bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
    parts=[('Jacket',(-1.52,.95,1.45),(.58,.29,.65),cloth,'spine'),('Face',(-1.52,.95,1.93),(.31,.26,.36),skin,'head'),('Hair',(-1.52,.96,2.12),(.34,.30,.12),hair,'head'),('LeftEye',(-1.61,.79,1.96),(.035,.015,.035),hair,'head'),('RightEye',(-1.43,.79,1.96),(.035,.015,.035),hair,'head'),('Nose',(-1.52,.77,1.89),(.045,.045,.055),skin,'head'),('Collar',(-1.52,.77,1.72),(.22,.04,.08),paper,'spine'),('LeftSleeve',(-1.18,.81,1.47),(.18,.21,.49),cloth,'arm.L'),('RightSleeve',(-1.86,.81,1.47),(.18,.21,.49),cloth,'arm.R'),('LeftHand',(-1.08,.71,1.23),(.12,.13,.18),skin,'arm.L'),('RightHand',(-1.94,.69,1.23),(.12,.13,.18),skin,'arm.R'),('LeftLeg',(-1.40,.95,.65),(.22,.27,.84),ink,'leg.L'),('RightLeg',(-1.64,.95,.65),(.22,.27,.84),ink,'leg.R'),('LeftShoe',(-1.40,.80,.16),(.27,.42,.16),hair,'leg.L'),('RightShoe',(-1.64,.80,.16),(.27,.42,.16),hair,'leg.R')]
    for name,loc,size,material,bone_name in parts:
        o=cube(name,loc,size,material,.035)
        group=o.vertex_groups.new(name=bone_name);group.add(list(range(len(o.data.vertices))),1.0,'REPLACE')
        o.parent=rig;modifier=o.modifiers.new('Armature skin','ARMATURE');modifier.object=rig
    return rig

def make(mode):
    clear()
    wall=mat('warm plaster',(0.83,.82,.75));floor=mat('stone floor',(.61,.66,.59));wood=mat('oiled oak',(.38,.28,.18));green=mat('sage painted steel',(.20,.34,.27));paper=mat('uncoated paper',(.94,.91,.81));terra=mat('terracotta notice',(.68,.31,.20));ink=mat('charcoal fabric',(.13,.19,.17));skin=mat('warm skin',(.58,.38,.27));hair=mat('dark hair',(.15,.12,.11));glass=mat('clock face',(.88,.88,.78))
    cube('Floor',(0,0,-.12),(8,5,.24),floor)
    cube('BackWall',(0,2.3,1.55),(8,.2,3.1),wall)
    cube('LeftWall',(-3.9,0,1.55),(.2,4.7,3.1),wall)
    cube('WindowFrame',(1.65,2.16,1.85),(2.15,.14,1.45),green,.05)
    cube('WindowLight',(1.65,2.07,1.85),(1.92,.05,1.22),paper,.02)
    cube('Skirting',(0,2.13,.14),(7.8,.08,.16),green)
    cylinder('WallClock',(2.95,2.02,2.45),.27,.07,green,24)
    cylinder('ClockFace',(2.95,1.96,2.45),.22,.075,glass,24)
    cube('ClockHandHour',(2.95,1.91,2.51),(.035,.02,.14),ink)
    cube('ClockHandMinute',(3.02,1.90,2.45),(.15,.02,.025),ink)
    rig=human(green,skin,hair,ink,paper)
    cube('ServiceDesk',(0,-.28,.88),(3.5,1.35,.13),wood,.045)
    cube('DeskFront',(0,-.64,.41),(3.35,.13,.84),green,.04)
    for x in [-1.45,1.45]:cube('DeskLeg', (x,.12,.43),(.13,.15,.85),wood)
    cube('EvidenceTray',(.35,-.52,.98),(1.22,.64,.055),green,.025)
    notice=cube('CurrentNoticeCard',(.33,-.52,1.035),(.74,.40,.014),terra,.008)
    cube('QuestionCard',(-.77,-.46,.98),(.55,.38,.014),paper,.005)
    label=cube('NoticeLabel',(.33,-.52,1.049),(.50,.045,.003),paper)
    label.parent=notice;label.matrix_parent_inverse=notice.matrix_world.inverted()
    cube('TaskBriefHolder',(-.67,.09,1.10),(.65,.08,.36),wood,.015)
    if mode=='library':
        for x in [1.88,2.60,3.30]:
            cube('LibraryShelf', (x,1.25,1.4),(.65,.48,2.3),wood,.02)
            for z in [.65,1.25,1.85,2.35]:
                cube('ShelfBoard',(x,.95,z),(.62,.55,.055),green)
                for j in range(4):cube('PublicReferenceVolume',(x-.24+j*.15,.88,z+.14),(.10,.18,.22),[paper,terra,green,wall][j],.01)
        cube('SearchIndexBoard',(.70,2.09,1.92),(1.15,.06,.62),green,.02)
        cube('CandidateCard',(.70,2.03,1.93),(.82,.02,.35),paper,.008)
        object_action(notice,'SearchNarrow',[(1,(0,0,0)),(20,(.3,.12,.08)),(41,(.8,.30,.15))])
    if mode=='service-counter':
        cube('CalendarTerminal',(.87,.19,1.21),(.79,.10,.64),ink,.04)
        cube('CalendarScreen',(.87,.13,1.22),(.66,.015,.48),paper,.01)
        cube('ProposalCard',(.88,-.61,1.025),(.56,.34,.012),paper,.005)
        object_action(bpy.data.objects['CalendarScreen'],'CalendarTimeout',[(1,(0,0,0)),(20,(0,0,.03)),(41,(0,0,0))])
    if mode=='briefing':
        object_action(notice,'PlaceNotice',[(1,(.45,.35,.30)),(20,(.22,.15,.16)),(41,(0,0,0))])
        object_action(notice,'RemoveNotice',[(1,(0,0,0)),(20,(.38,.13,.23)),(41,(.78,.25,.36))])
        question=bpy.data.objects['QuestionCard']
        object_action(question,'ReceiveQuestion',[(1,(-.5,-.8,.10)),(20,(-.22,-.4,.12)),(41,(0,0,0))])
    neutral={'arm.R':(0,0,0),'arm.L':(0,0,0),'head':(0,0,0)}
    reach={'arm.R':(.25,-.15,-.30),'arm.L':(-.12,.05,.12),'head':(.05,0,0)}
    lift={'arm.R':(-.15,-.25,-.52),'arm.L':(0,0,0),'head':(.02,0,0)}
    for name,pose in ([('ReceiveQuestion',reach),('PlaceNotice',lift),('RemoveNotice',reach)] if mode=='briefing' else [('SearchNarrow',reach)] if mode=='library' else [('CalendarTimeout',lift)]):
        action_for(rig,name,[(1,neutral),(20,pose),(41,neutral)])
    bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=41;bpy.context.scene.render.fps=24
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTER / f'{mode}.blend'))
    bpy.ops.export_scene.gltf(filepath=str(OUT / f'{mode}.glb'),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_apply=False)
    print('EXPORTED',mode,(OUT / f'{mode}.glb').stat().st_size)
for room in ['briefing','library','service-counter']:make(room)
