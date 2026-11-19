"""Render the authored English narration to optional MP3 files using FFmpeg's Flite voice."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

root=Path(__file__).resolve().parents[1]
out=root/'public'/'audio';out.mkdir(parents=True,exist_ok=True)
source=(root/'src'/'briefing-lesson.ts').read_text()
briefing=re.findall(r"id: '([^']+)'.*?narration: '([^']+)'",source)
assert len(briefing)==5, 'Briefing script extraction changed; review before rendering.'
extended=json.loads((root/'content'/'extended.json').read_text())
scripts={f'briefing-{index+1}':text for index,(_,text) in enumerate(briefing)}
scripts.update({room['id']:room['narration'] for room in extended['rooms']})
manifest={}
for name,text in scripts.items():
    script_file=out/f'{name}.txt'
    script_file.write_text(text+'\n')
    destination=out/f'{name}.mp3'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',f'flite=textfile={script_file}:voice=slt','-ac','1','-ar','24000','-codec:a','libmp3lame','-b:a','48k',str(destination)],check=True)
    script_file.unlink()
    manifest[name]={'file':f'/audio/{name}.mp3','bytes':destination.stat().st_size,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'scriptSha256':hashlib.sha256(text.encode()).hexdigest()}
(root/'assets'/'audio-manifest.json').write_text(json.dumps({'generator':'FFmpeg Flite slt / MP3 48 kbps mono','tracks':manifest},indent=2)+'\n')
print(f"Rendered {len(scripts)} narration tracks ({sum(x['bytes'] for x in manifest.values()):,} bytes)")
