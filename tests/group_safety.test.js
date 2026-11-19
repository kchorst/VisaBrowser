import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { classify, compare, rank, sourceDelayed } from '../site/rules.js';
import { sample, alex, aline } from './fixtures.js';

const single = (options, extra = {}) => ({ rows: [{ options, ...extra }], issues: 0, pending: options.includes('pending') ? 1 : 0 });

test('NO ISSUES categories reject every unresolved, conditional or foreign-document route', () => {
  assert.equal(classify(single(['free'])), 'free');
  assert.equal(classify(single(['free'], { condition: 'Only at one airport' })), 'steps');
  assert.equal(classify(single(['free'], { flags: ['Online registration'] })), 'steps');
  assert.equal(classify(single(['free'], { controls: [{ field: 'qualify' }] })), 'review');
  assert.equal(classify(single(['existing'])), 'review');
  assert.equal(classify(single(['free'], { viaDocument: true })), 'review');
  assert.equal(classify(single(['pending'])), 'review');
  assert.equal(classify(single(['denied'])), 'required');
  assert.equal(classify(single(['advance'])), 'required');
  assert.equal(classify(single(['permit'])), 'required');
  assert.equal(classify(single(['evisa'])), 'authorization');
  assert.equal(classify(single(['arrival'])), 'authorization');
  assert.equal(classify(single(['residentArrival'])), 'authorization');
  assert.equal(classify(single(['free'], { source: { lastSuccess: '2020-01-01T00:00:00Z', url: 'https://example.com/' } })), 'review');
  assert.equal(classify({ rows: [], issues: 0, pending: 0 }), 'review');
});

test('Mixed groups always use the most restrictive requirement and include actual category counts', () => {
  const results = rank([['A','A'], ['B','B'], ['C','C'], ['D','D'], ['E','E']],
    [alex, aline], sample);
  assert.deepEqual(results.map(section => [section.id, section.destinations.length]),
    [['free', 1], ['steps', 0], ['authorization', 2], ['required', 1], ['review', 1]]);
  const visa = compare([alex, aline], 'E', sample);
  assert.equal(classify(visa), 'required');
  const unknown = compare([alex, aline], 'D', sample);
  assert.equal(classify(unknown), 'review');
  const supported = { ...aline, documents: [{ id: 'permit', issuer: 'US', type: 'permit' }] };
  const conditionalFree = compare([alex, supported], 'D', sample);
  assert.equal(conditionalFree.group, 'Visa-free with conditions');
  assert.equal(conditionalFree.rows[1].viaDocument, true);
  assert.equal(classify(conditionalFree), 'review');
  assert.equal(sourceDelayed({ lastSuccess: '2000-01-01T00:00:00Z' }), true);
});

test('Mobile UX keeps one disclaimer on each report and never claims passport expiry was verified', () => {
  const app = readFileSync(new URL('../site/app.js', import.meta.url), 'utf8');
  assert.match(app, /Important Travel Requirements & Disclaimer/);
  assert.match(app, /passport validity and blank pages/);
  assert.match(app, /function reportText\(/);
  assert.match(app, /navigator\.share/);
  assert.doesNotMatch(app, /Passport reminder|Enter passport expiration/);
  assert.match(app, /function savedNeedsRefresh\(/);
  assert.match(app, /function leaveUnsaved\(/);
  assert.match(app, /comparedItinerary\.slice\(\)/);
});
