from hashlib import sha256
import json
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / 'site/data'


def offline_manifest(data=DATA):
    index = json.loads((data / 'index.json').read_text(encoding='utf-8'))
    names = ['index.json', 'places.json'] + [
        f'passports/{code}.json' for code, source in sorted(index['sources'].items())
        if source.get('lastSuccess')
    ]
    files = {name: sha256((data / name).read_bytes()).hexdigest() for name in names}
    version = sha256(json.dumps(files, sort_keys=True).encode()).hexdigest()
    return {'version': version, 'generated': index['generated'], 'files': files}


def write_manifest(data=DATA):
    manifest = offline_manifest(data)
    (data / 'offline-manifest.json').write_text(
        json.dumps(manifest, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    write_manifest()
