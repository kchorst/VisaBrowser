import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { p2Notice } from '../site/p2-audit.js';
import { p2Scope } from '../site/p2-scope.js';
import { compare } from '../site/rules.js';
import { touristDetails } from '../site/tourist.js';

const readData = name => JSON.parse(readFileSync(new URL('../site/data/' + name + '.json', import.meta.url)));
const catalog = readData('index');
const shards = new Map();
function evaluate(passport, destination, facts = {}, documents = []) {
  if (!shards.has(passport)) shards.set(passport, readData('passports/' + passport));
  return compare([{ passport, facts, documents }], destination, { [passport]: shards.get(passport) }).rows[0];
}

const pairs = Object.entries(p2Scope).flatMap(([destination, groups]) =>
  groups.flatMap(([, passports]) => passports.split(' ').map(passport => ({ passport, destination }))));
const sampleKey = ({ passport, destination }) =>
  createHash('sha256').update(`p2-v0.4.12/${passport}/${destination}`).digest('hex');

test('All 5,871 P2 keys are unique and the closeout authority referrals remain visible', () => {
  assert.equal(pairs.length, 5871);
  assert.equal(new Set(pairs.map(pair => pair.passport + '/' + pair.destination)).size, 5871);
  const closeout = readFileSync(new URL('../docs/verification/P2-CLOSEOUT-ROWS-2026-11-21.csv', import.meta.url), 'utf8')
    .trim().split('\n').slice(1).map(line => line.split(','));
  assert.equal(closeout.length, 2116);
  for (const [passport, destination, , disposition] of closeout) {
    const note = p2Notice(destination, passport);
    assert.ok(note, `${passport}/${destination}`);
    if (disposition === 'refer') assert.equal(note.heading, 'Confirm entry details');
  }
  assert.equal(p2Notice('TH', 'TH'), null);
});

test('Deterministic 10% P2 verification runs 588 exact pairs through comparison and traveler notices', () => {
  const selected = pairs.map(pair => ({ ...pair, key: sampleKey(pair) }))
    .sort((a, b) => a.key.localeCompare(b.key)).slice(0, Math.ceil(pairs.length / 10));
  assert.equal(selected.length, 588);
  for (const { passport, destination } of selected) {
    const id = `${passport}/${destination}`;
    assert.ok(catalog.passports.includes(passport) && catalog.destinations.includes(destination), id);
    const row = evaluate(passport, destination);
    assert.ok(row.options.length, `Missing classification: ${id}`);
    const notice = p2Notice(destination, passport);
    assert.ok(notice.text.length > 40, `Missing traveler guidance: ${id}`);
    assert.match(notice.url, /^https:\/\//, id);
    for (const link of notice.more) assert.match(link, /^https:\/\//, id);
    assert.equal(notice.auditDate, '2026-11-21', id);
    assert.deepEqual(touristDetails(destination, row).at(-1), notice, `Notice absent from result/report: ${id}`);
  }
});

test('Thailand separates ordinary, bilateral and route-dependent cases', () => {
  for (const passport of ['CZ', 'DK', 'HU', 'CN', 'AT']) {
    const row = evaluate(passport, 'TH');
    assert.equal(row.stay, 'Up to 30 days');
    assert.deepEqual(row.options, ['free']);
    assert.match(row.flags.join(' '), /Digital Arrival Card/);
  }
  assert.match(evaluate('MM', 'TH').condition, /international airports/);
  assert.deepEqual(evaluate('UZ', 'TH').options, ['advance']);
  assert.deepEqual(evaluate('BNO', 'TH').options, ['pending']);
});

test('Canada and New Zealand authorize only the confirmed air routes', () => {
  assert.match(evaluate('BNO', 'CA').condition, /Saint-Pierre-et-Miquelon/);
  assert.deepEqual(evaluate('RO', 'CA').options, ['pending']);
  assert.deepEqual(evaluate('BR', 'CA', { 'p2:ca-history': 'yes' }).options, ['advance']);
  assert.deepEqual(evaluate('BR', 'CA', { 'p2:ca-air': 'yes', 'p2:ca-history': 'yes' }).options, ['free']);
  assert.deepEqual(evaluate('CN', 'NZ', { 'p2:nz-direct': 'no', 'p2:nz-visa': 'yes' }).options, ['advance']);
  for (const passport of ['CN', 'FJ', 'WS']) {
    const row = evaluate(passport, 'NZ', { 'p2:nz-direct': 'yes', 'p2:nz-visa': 'yes' });
    assert.match(row.status, /NZeTA visitor/);
    assert.ok(row.flags.some(flag => /NZeTA/.test(flag)));
  }
  const australian = evaluate('AU', 'NZ');
  assert.ok(australian.flags.some(flag => /Traveller Declaration/.test(flag)));
  assert.ok(!touristDetails('NZ', australian).some(notice => notice.heading === 'Proof of onward travel'));
  const permanent = evaluate('CN', 'NZ', {}, [{ issuer: 'AU', type: 'permit', valid: true, qualifications: { NZ: true } }]);
  assert.deepEqual(permanent.options, ['residentArrival']);
});

test('Port conflicts, approvals and route-specific permits are explicit', () => {
  assert.match(evaluate('BR', 'MX').condition, /single entry by air/);
  assert.match(evaluate('AR', 'MX').notes.join(' '), /MXN 983/);
  assert.deepEqual(evaluate('BH', 'CV').options, ['pending']);
  assert.deepEqual(evaluate('GT', 'MR').options, ['pending']);
  assert.match(evaluate('DE', 'MR').condition, /before boarding/);
  assert.deepEqual(evaluate('FR', 'PN').options, ['pending']);
  assert.deepEqual(evaluate('FR', 'PN', { 'p2:pn-vessel': 'no' }).options, ['permit']);
  assert.deepEqual(evaluate('FR', 'PN', { 'p2:pn-vessel': 'yes' }).options, ['arrival']);
  assert.deepEqual(evaluate('US', 'PS').options, ['pending']);
  assert.deepEqual(evaluate('DE', 'X-SOS').options, ['pending']);
  assert.match(p2Notice('NA', 'CZ').text, /Eros Airport/);
  assert.match(p2Notice('IN', 'AE').text, /Official lists differ/);
  for (const passport of ['BA', 'GY', 'MX']) assert.deepEqual(evaluate(passport, 'SA').options, ['evisa']);
});
