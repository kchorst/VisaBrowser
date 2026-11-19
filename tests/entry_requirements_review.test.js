import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test, mock } from 'node:test';
import { compare, classify, rank, statuses, noAdvanceVisa } from '../site/rules.js';

const read = file => JSON.parse(readFileSync(new URL('../site/data/' + file, import.meta.url)));
const catalog = read('index.json');
const person = (passport, documents = []) => ({ passport, documents, facts: {}, name: passport });
const passports = ['US', 'KW', 'CA', 'BR', 'NI', 'TW', 'IE'];
const data = Object.fromEntries(passports.map(passport => [passport, {
  ...catalog.sources[passport],
  ...read('passports/' + passport + '.json'),
  homeCountry: catalog.homeCountries.includes(passport) ? passport : undefined
}]));
const row = (p,d) => compare([person(p)], d, data).rows[0];

test('UK ETA uses reviewed nationalities, current fee, and a distinct additional step', () => {
  for (const passport of ['US','CA','BR']) {
    const result = compare([person(passport)], 'GB', data);
    const traveler = result.rows[0];
    assert.equal(traveler.options[0], 'free');
    assert.equal(result.pending, 0);
    assert(traveler.official.startsWith('https://www.gov.uk/'));
    assert(traveler.flags.some(f => f.includes('ETA')));
    assert(traveler.notes.some(n => n.includes('£20')));
    assert.match(traveler.fee, /£20/);
    assert.equal(classify(result), 'steps');
    assert(!noAdvanceVisa(result) || traveler.flags.length);
  }
  assert.equal(classify(compare([person('IE')], 'GB', data)), 'free');
  assert.equal(row('TW', 'GB').options[0], 'pending');
  // A source waiver that contradicts the UK government's removed-nationality
  // list must not silently turn into an ETA approval.
  const ni = row('NI','GB');
  assert.notEqual(ni.options[0], 'free');
});

test('US Mexico arrival paperwork and Korea 2026 K-ETA exemption do not mean a tourist visa', () => {
  const mx = compare([person('US')], 'MX', data);
  assert.deepEqual(mx.rows[0].options, ['free']);
  assert.equal(classify(mx), 'steps');
  assert(mx.rows[0].flags.join(' ').includes('FMM'));
  assert(mx.rows[0].official.includes('travel.state.gov'));
  const kr = compare([person('US')], 'KR', data);
  assert.deepEqual(kr.rows[0].options, ['free']);
  assert.equal(kr.pending, 0);
  assert.equal(classify(kr), 'steps');
  assert(kr.rows[0].flags.some(f => f.includes('e-Arrival')));
});

test('Australia ETA is a subclass 601 visa, NZ NZeTA is not an Australian ETA visa', () => {
  const au = compare([person('US')], 'AU', data);
  assert.deepEqual(au.rows[0].options, ['evisa']);
  assert.match(statuses(au.rows[0]), /subclass 601/i);
  assert.equal(classify(au), 'authorization');
  const nz = compare([person('US')], 'NZ', data);
  assert.deepEqual(nz.rows[0].options, ['free']);
  assert.equal(classify(nz), 'steps');
  assert(nz.rows[0].flags.join(' ').includes('NZeTA'));
});

test('Kuwait-to-NZ waiver suspension blocks tourist NZeTA from 12 Nov 2026', () => {
  const clock = mock.method(Date, 'now', () => Date.parse('2026-11-19T10:00:00+13:00'));
  try {
    const blocked = compare([person('KW')], 'NZ', data);
    assert.equal(blocked.rows[0].options[0], 'advance');
    assert.equal(classify(blocked), 'required');
    assert.match(blocked.rows[0].condition, /suspended/i);
    assert.equal(noAdvanceVisa(blocked), false);
    const resident = person('KW',[{id:'au-pr', issuer:'AU', type:'permit', valid:true, qualifications:{NZ:true}}]);
    assert.equal(compare([resident], 'NZ', data).rows[0].options[0], 'residentArrival');
    const uncertain = person('KW',[{id:'au-pr', issuer:'AU', type:'permit', valid:true}]);
    assert.equal(compare([uncertain], 'NZ', data).rows[0].options[0], 'pending');
    clock.mock.mockImplementation(() => Date.parse('2027-02-12T00:01:00+13:00'));
    assert.equal(compare([person('KW')], 'NZ', data).rows[0].options[0], 'pending');
  } finally { clock.mock.restore(); }
});

test('Free entries with steps are distinguished from unsupported/passport-specific uncertainty', () => {
  const sample = {
    A: { rules: {
      X: { options: ['free'], condition: 'Complete an arrival card' },
      Y: { options: ['free'] },
      Z: { options: ['free'], flags: ['Registration required'] },
      W: { options: ['pending'], reason: 'Eligibility unknown' }
    }, lastSuccess: new Date().toISOString(), homeCountry: 'A' }
  };
  const rows = rank([['X','X'], ['Y','Y'], ['Z','Z'], ['W','W']], [person('A')], sample);
  assert.deepEqual(rows.map(group => [group.id, group.destinations.length]), [
    ['free',1],['steps',2],['authorization',0],['required',0],['review',1]
  ]);
});
