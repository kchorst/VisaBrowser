"""Run VisaBrowser on loopback or download the published visa data."""

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from functools import partial
from hashlib import sha256
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import sys
from tempfile import TemporaryDirectory
from urllib.parse import unquote, urlsplit
from urllib.request import urlopen
import webbrowser

SITE = Path(__file__).resolve().parents[1] / 'site'
DATA_HOME = SITE.parent / '.visa-data'
BASE_URL = 'https://kchorst.github.io/VisaBrowser/data/'
PORT = 8000
MANIFEST = 'offline-manifest.json'
HASH = re.compile(r'[0-9a-f]{64}')
RULE_FILE = re.compile(r'(?:index\.json|places\.json|passports/[A-Z-]+\.json)')


def read_json(path):
    return json.loads(path.read_bytes())


def data_dir():
    candidates = [SITE / 'data']
    if DATA_HOME.exists():
        candidates.extend(p for p in DATA_HOME.iterdir()
                          if HASH.fullmatch(p.name) and (p / MANIFEST).is_file())
    return max(candidates, key=lambda p: (
        datetime.fromisoformat(read_json(p / MANIFEST)['generated']), p != SITE / 'data', p.stat().st_mtime_ns))


def fetch(name):
    with urlopen(BASE_URL + name, timeout=30) as response:
        return response.read()


def update():
    manifest_bytes = fetch(MANIFEST)
    manifest = json.loads(manifest_bytes)
    files = manifest['files']
    if (not HASH.fullmatch(manifest['version'])
            or not {'index.json', 'places.json'} <= files.keys()
            or not all(RULE_FILE.fullmatch(name) and HASH.fullmatch(digest) for name, digest in files.items())):
        raise ValueError('The published data manifest is invalid.')
    current = read_json(data_dir() / MANIFEST)
    if (manifest['version'] == current['version']
            or datetime.fromisoformat(manifest['generated']) < datetime.fromisoformat(current['generated'])):
        print(f"Visa data is current ({current['generated'][:10]}).")
        return
    DATA_HOME.mkdir(exist_ok=True)
    target = DATA_HOME / manifest['version']
    if not target.exists():
        with TemporaryDirectory(dir=DATA_HOME) as stage:
            staged = Path(stage) / 'data'
            staged.mkdir()
            (staged / 'passports').mkdir()

            def download(item):
                name, digest = item
                payload = fetch(name)
                if sha256(payload).hexdigest() != digest:
                    raise ValueError(f'The published copy changed during download ({name}). Try again.')
                (staged / name).write_bytes(payload)

            print(f'Downloading and checking {len(files)} visa data files…', flush=True)
            with ThreadPoolExecutor(max_workers=6) as pool:
                for _ in pool.map(download, files.items()):
                    pass
            index = read_json(staged / 'index.json')
            if index.get('schema') != 1 or index.get('generated') != manifest['generated']:
                raise ValueError('This visa dataset requires a newer VisaBrowser release or is incomplete.')
            required = {f'passports/{code}.json' for code, source in index['sources'].items() if source.get('lastSuccess')}
            if not required <= files.keys():
                raise ValueError('The published dataset is missing passport files.')
            (staged / MANIFEST).write_bytes(manifest_bytes)
            try:
                staged.rename(target)
            except OSError:
                if not (target / MANIFEST).is_file():
                    raise
    print(f"Visa data updated to {manifest['generated'][:10]}. Close and restart VisaBrowser to use it.")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, visa_data, **kwargs):
        self.visa_data = visa_data
        super().__init__(*args, directory=SITE, **kwargs)

    def translate_path(self, path):
        relative = unquote(urlsplit(path).path).removeprefix('/')
        if relative.startswith('data/'):
            name = relative.removeprefix('data/')
            if RULE_FILE.fullmatch(name) or name == MANIFEST:
                return str(self.visa_data / name)
        return super().translate_path(path)


def launch():
    address = f'http://localhost:{PORT}/'
    with ThreadingHTTPServer(('127.0.0.1', PORT), partial(Handler, visa_data=data_dir())) as server:
        print(f'VisaBrowser is running at {address}', flush=True)
        print('Keep this window open while you use the app. Press Ctrl+C to stop.', flush=True)
        webbrowser.open(address)
        server.serve_forever()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--update', action='store_true', help='Download published visa data')
    args = parser.parse_args()
    try:
        update() if args.update else launch()
    except KeyboardInterrupt:
        pass
    except (OSError, ValueError, TypeError, KeyError) as exc:
        print(f'VisaBrowser could not {"download fresh data" if args.update else "start"}: {exc}', file=sys.stderr)
        if args.update:
            print('The previous complete dataset is still available.', file=sys.stderr)
        else:
            print(f'If port {PORT} is in use, close the other local server and try again.', file=sys.stderr)
        sys.exit(1)
