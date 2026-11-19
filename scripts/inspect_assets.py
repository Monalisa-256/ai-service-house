"""Inspect generated GLBs, write a reproducible manifest, and fail missing rig/clips."""
import json, struct, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
required={'briefing':['ReceiveQuestion','PlaceNotice','RemoveNotice'],'library':['SearchNarrow'],'service-counter':['CalendarTimeout']}
manifest={'schemaVersion':'1','generator':'Blender 4.3.2 + glTF Transform 4.5.1','rooms':{}}
for room, expected in required.items():
    file=root/'public'/'models'/f'{room}.glb';raw=root/'assets'/'export'/f'{room}.raw.glb'
    b=file.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);names=[a['name'] for a in d.get('animations',[])]
    if sorted(names)!=sorted(expected) or not d.get('skins'):raise SystemExit(f'{room}: missing clips or skin {names}')
    node_names={node.get('name') for node in d.get('nodes',[])}
    for name in ['ServiceWorkerRig','CurrentNoticeCard','EvidenceTray','WallClock']:
        if name not in node_names:raise SystemExit(f'{room}: missing node {name}')
    triangles=sum(d['accessors'][prim['indices']]['count']//3 for mesh in d.get('meshes',[]) for prim in mesh['primitives'] if 'indices' in prim)
    manifest['rooms'][room]={'optimized':f'/models/{room}.glb','sha256':hashlib.sha256(b).hexdigest(),'rawBytes':raw.stat().st_size,'optimizedBytes':len(b),'savingPercent':round(100*(1-len(b)/raw.stat().st_size),1),'blenderBytes':(root/'assets'/'blender'/f'{room}.blend').stat().st_size,'nodes':len(d.get('nodes',[])),'meshes':len(d.get('meshes',[])),'triangles':triangles,'skins':len(d.get('skins',[])),'materials':len(d.get('materials',[])),'textures':len(d.get('textures',[])),'clips':names,'clipDurationsSeconds':{a['name']:round(max(d['accessors'][sampler['input']]['max'][0] for sampler in a['samplers']),3) for a in d.get('animations',[])}}
(root/'assets'/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest['rooms'],indent=2))
