"""Write a deterministic inventory of tracked source, content, and runtime assets."""
import hashlib
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
files = [name.decode() for name in subprocess.check_output(['git','ls-files','-z'], cwd=root).split(b'\0') if name]
groups = {'code': [], 'content': [], 'assets': [], 'docs': []}
for name in files:
    if name.startswith(('src/','scripts/','test/')) or name in ('package.json','package-lock.json','vite.config.ts','tsconfig.json','vercel.json'):
        group='code'
    elif name.startswith('content/'):
        group='content'
    elif name.startswith(('assets/','public/')):
        group='assets'
    elif name.startswith('docs/') or name == 'README.md':
        group='docs'
    else:
        continue
    groups[group].append({'path':name,'sha256':hashlib.sha256((root/name).read_bytes()).hexdigest()})
manifest = {
    'schemaVersion':1,
    'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),
    'contentVersion':json.loads((root/'content'/'extended.json').read_text())['contentVersion'],
    'groups':groups,
}
(root/'release-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f"Release inventory: {sum(map(len,groups.values()))} tracked files; commit {manifest['commit'][:12]}")
