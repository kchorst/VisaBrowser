import argparse
import importlib.util
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('refresh', Path(__file__).resolve().parents[1] / 'scripts/refresh.py')
refresh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh)


class ImportTests(unittest.TestCase):
    def test_header_aliases_and_territory_rows(self):
        page = b'''
        <title>Visa requirements for Example citizens - Wikipedia</title>
        <table class="wikitable"><tr><th>Country</th><th>Entry requirement</th>
        <th>Stay duration</th><th>Notes</th></tr>
        <tr><td>France</td><td>Visa not required</td><td>90 days</td><td>Tourist registration required.</td></tr>
        </table>
        <table class="wikitable"><tr><th>Territory</th><th>Conditions of access</th><th>Notes</th></tr>
        <tr><th colspan="3">France</th></tr>
        <tr><td>France - French Guiana</td><td>Visa on arrival</td><td>Only available at Harbor International Airport.</td></tr>
        <tr><td>France - Unrecognized Island</td><td>Visa required</td><td></td></tr>
        <tr><td>Aruba</td><td>Visa not required</td><td>Visa required.</td></tr>
        </table>
        '''
        rules, issues, _ = refresh.parse('XX',
            {'titles': ['Visa requirements for Example citizens'], 'smallTable': True}, page,
            'https://en.wikipedia.org/wiki/example', {'FR': 'France', 'GF': 'French Guiana', 'AW': 'Aruba'})
        self.assertEqual(rules['FR']['stay'], '90 days')
        self.assertEqual(rules['FR']['flags'], ['Tourist registration'])
        self.assertEqual(rules['GF']['options'], ['arrival'])
        self.assertIn('Harbor International Airport', rules['GF']['condition'])
        self.assertIn('different', rules['AW']['reason'].replace('conflicting', 'different'))
        self.assertTrue(any(issue['destination'] == 'France - Unrecognized Island' for issue in issues))

    def test_reject_wrong_article_and_unusable_table(self):
        places = {'FR': 'France'}
        payload = b'<title>Visa requirements for Example citizens - Wikipedia</title>'
        url = 'https://en.wikipedia.org/wiki/example'
        with self.assertRaisesRegex(ValueError, 'does not match passport'):
            refresh.parse('XX', {'titles': ['Wrong passport']}, payload, url, places)
        with self.assertRaisesRegex(ValueError, 'No usable visa table'):
            refresh.parse('XX', {'titles': ['Visa requirements for Example citizens']}, payload, url, places)

    def test_extract_options_flags_and_unknowns(self):
        self.assertEqual(refresh.classify('eVisa / Visa on arrival'), ['evisa', 'arrival'])
        self.assertEqual(refresh.classify('Admission refused'), ['denied'])
        self.assertEqual(refresh.classify('Admission restricted'), [])
        self.assertEqual(refresh.classify('Visa not required / eVisa'), [])
        self.assertNotIn('fee', refresh.extract_rule('eVisa', '', []))
        self.assertEqual(refresh.extract_rule('Free visa on arrival', '14 days', [])['fee'], 'Free')

    def test_failed_refresh_retains_last_good_shard_and_records_failure(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            data = root / 'data'
            scripts = root / 'scripts'
            (data / 'passports').mkdir(parents=True)
            scripts.mkdir()
            url = 'https://en.wikipedia.org/wiki/example'
            old_success = '2026-11-17T12:00:00+00:00'
            last_good = {'lastSuccess': old_success, 'rules': {'FR': {'options': ['free']}}, 'issues': []}
            starting_files = {
                scripts / 'sources.json': {
                    'sources': {'US': {'url': url, 'titles': ['Example']}},
                    'primaryDestinations': ['FR', 'US'], 'otherCandidates': [],
                },
                scripts / 'document-exceptions.json': {},
                data / 'places.json': {'FR': 'France', 'US': 'United States'},
                data / 'index.json': {'destinations': ['FR'], 'sources': {'US': {'url': url, 'lastSuccess': old_success}}},
                data / 'passports' / 'US.json': last_good,
            }
            for path, value in starting_files.items():
                path.write_text(json.dumps(value))
            with patch.object(refresh, 'ROOT', root), patch.object(refresh, 'DATA', data), patch.object(
                    refresh, 'load_url', side_effect=ValueError('Missing requirement column')):
                refresh.refresh(argparse.Namespace(seed_html=None))
            meta = refresh.read_json(data / 'index.json')['sources']['US']
            self.assertEqual(meta['lastSuccess'], old_success)
            self.assertEqual(meta['error'], 'Missing requirement column')
            self.assertEqual(refresh.read_json(data / 'passports' / 'US.json'), last_good)


if __name__ == '__main__':
    unittest.main()
