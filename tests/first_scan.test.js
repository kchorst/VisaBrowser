import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { firstScanEntryAlerts } from '../site/first-scan-alerts.js';

const places = JSON.parse(readFileSync(new URL('../site/data/places.json', import.meta.url), 'utf8'));

test('First-scan checks preserve destination boundaries and uncertainty', () => {
  const { destinations, notes } = firstScanEntryAlerts;
  assert.equal(Object.keys(destinations).length, 275);
  for (const [id, destination] of Object.entries(destinations)) {
    assert.ok(places[id], `Missing destination ${id}`);
    assert.ok(destination.scanStatus);
    assert.ok(Number.isInteger(destination.openChecks));
  }
  assert.match(destinations['X-SHT'].scanStatus, /partial/);
  assert.ok(notes.IT.some(note => note.format === 'generic_research_prompt'));
  assert.ok(notes['X-ASC'].some(note => /visa/i.test(note.text)));
  assert.ok(!notes['X-TDC']?.some(note => /Island Council permission/.test(note.text)));
  assert.ok(!Object.values(notes).flat().some(note => note.category === 'Pets and animal importation'));
  for (const note of Object.values(notes).flat()) {
    assert.ok(['http:', 'https:'].includes(new URL(note.url).protocol));
    assert.ok(note.scope && note.status && note.authority);
  }
});
