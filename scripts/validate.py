import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit

from refresh import home_countries
from build_offline import offline_manifest

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'site/data'
ALLOWED = {'free', 'advance', 'evisa', 'arrival', 'denied'}


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def validate():
    catalog = read(DATA / 'index.json')
    places = read(DATA / 'places.json')
    cfg = read(ROOT / 'scripts/sources.json')
    assert catalog['schema'] == 1
    assert read(DATA / 'offline-manifest.json') == offline_manifest(), 'Offline manifest is stale'
    assert catalog['overdueDays'] > 7
    for name in ('passports', 'destinations'):
        assert len(set(catalog[name])) == len(catalog[name]), f'Duplicate {name}'
        assert all(code in places for code in catalog[name]), f'Unlabeled {name}'
    assert set(cfg['primaryDestinations']) <= set(catalog['destinations'])
    assert catalog['homeCountries'] == home_countries(cfg)
    assert set(catalog['homeCountries']) <= set(catalog['passports'])
    coverage = read(DATA / 'coverage-issues.json')
    assert all(all(key in issue for key in ('passport', 'destination', 'reason', 'source')) for issue in coverage)
    for code, meta in catalog['sources'].items():
        assert code in catalog['passports']
        assert urlsplit(meta['url']).hostname == 'en.wikipedia.org'
        path = DATA / 'passports' / f'{code}.json'
        if not meta.get('lastSuccess'):
            assert meta.get('error'), f'Missing failure metadata for {code}'
            assert not path.exists(), f'Unexpected unvalidated shard for {code}'
            continue
        shard = read(path)
        assert shard['lastSuccess'] == meta['lastSuccess'], f'Heartbeat mismatch for {code}'
        assert len(shard['rules']) >= 70 or cfg['sources'][code].get('smallTable')
        assert set(shard['rules']) <= set(catalog['destinations'])
        for place, rule in shard['rules'].items():
            assert bool(rule.get('reason')) != bool(rule.get('options')), f'Invalid rule {code}/{place}'
            assert not (set(rule.get('options', [])) - ALLOWED), f'Unrecognized status {code}/{place}'
            assert 'sourceText' in rule
            for exception in rule.get('exceptions', []):
                assert set(exception['issuers']) <= set(places)
                assert set(exception['result']['options']) <= ALLOWED
    for code in ('US', 'RW', 'FR', 'SG'):
        assert catalog['sources'][code].get('lastSuccess'), f'Missing required source {code}'
    version = read(ROOT / 'package.json')['version']
    assert re.fullmatch(r'\d+\.\d+\.\d+', version)
    assert f"'{version}'" in (ROOT / 'site/version.js').read_text()
    print(f"Validated {sum(bool(s.get('lastSuccess')) for s in catalog['sources'].values())} passport data files")


if __name__ == '__main__':
    try:
        validate()
    except (AssertionError, OSError, KeyError, ValueError) as exc:
        sys.exit(f'Data validation failed: {exc}')
