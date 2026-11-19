import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test, mock } from 'node:test';
import { compare, groupDetail, rank, requirementChange, resultSnapshot, sixMonthsFrom,
  sourceDelayed, statuses } from '../site/rules.js';
import { alex, aline, sample, stamp } from './fixtures.js';

mock.method(Date, 'now', () => Date.parse(stamp));

test('Walkthroughs 1–4 and 6 classify and rank the group', () => {
  const data = rank(['E', 'D', 'C', 'B', 'A'].map(id => [id, id]), [alex, aline], sample);
  assert.deepEqual(data.map(({ id, destinations }) => [id, destinations.map(d => d.id)]), [
    ['free', ['A']], ['steps', []], ['authorization', ['B', 'C']], ['required', ['E']], ['review', ['D']]
  ]);
  const a = data[0].destinations[0].result;
  const b = data[2].destinations[0].result;
  const c = data[2].destinations[1].result;
  const e = data[3].destinations[0].result;
  const d = data[4].destinations[0].result;
  assert.equal(a.issues, 0);
  assert(!a.rows.some(row => row.questions));
  assert.equal(b.rows[0].issue, false);
  assert.equal(b.rows[1].issue, true);
  assert.equal(b.rows[1].stay, undefined);
  assert.equal(b.rows[1].fee, undefined);
  assert.equal(c.issues, 0);
  assert.equal(statuses(c.rows[1]), 'Visa on arrival*');
  assert.match(c.rows[1].condition, /Harbor International Airport/);
  assert.equal(e.rows.filter(row => row.issue).length, 2);
  assert.equal(groupDetail(d), '1 visa-free · 1 pending verification');
  assert.equal(d.rows[1].questions[0].field, 'type');
  for (const [type, group, issues] of [['permit', 'Visa-free with conditions', 0], ['visa', '', 1]]) {
    const person = { ...aline, documents: [{ ...aline.documents[0], type }] };
    const result = compare([alex, person], 'D', sample);
    assert.equal(result.group, group);
    assert.equal(result.issues, issues);
  }
});

test('Walkthrough 5 retains saved input, compares fresh data, and keeps last good results', () => {
  const current = structuredClone([alex, aline]);
  current[1].documents[0].type = 'permit';
  const passengers = structuredClone(current);
  const saved = { passengers, snapshot: resultSnapshot(compare(passengers, 'D', sample)) };
  current.pop();
  assert.equal(saved.passengers.length, 2);
  const updated = structuredClone(sample);
  delete updated.RW.rules.D.exceptions;
  updated.RW.lastSuccess = '2026-11-24T12:00:00+00:00';
  const result = compare(passengers, 'D', updated);
  assert.equal(requirementChange(result.rows[0], saved), '');
  assert.match(requirementChange(result.rows[1], saved), /changed from Visa-free/);
  updated.RW.error = 'Missing columns';
  assert(sourceDelayed(updated.RW, new Date(updated.RW.lastSuccess)));
  assert.deepEqual(compare(passengers, 'D', updated).rows[1].options, ['advance']);
  assert(sourceDelayed({ lastSuccess: stamp }, new Date('2026-12-02T00:00:00Z')));
});

test('Pending, mixed groups, competing rules, territory rows, and preparation flags', () => {
  const unsupported = { id: 'unsupported', passport: 'ZZ' };
  assert.match(compare([unsupported], 'A', sample).rows[0].reason, /No usable/);
  const mixed = compare([alex, aline, unsupported], 'B', sample);
  assert.equal(mixed.issues, 1);
  assert.equal(mixed.pending, 1);
  assert.equal(mixed.group, '');
  const noFree = compare([alex, { ...aline, passport: 'ZZ' }], 'C', sample);
  assert.equal(noFree.issues, 0);
  const territory = compare([alex, aline], 'AW', sample);
  assert.equal(territory.group, 'Visa-free with conditions');
  assert.equal(territory.rows[0].flags[0], 'Tourist registration');
  assert.deepEqual(compare([alex], 'CONFLICT', sample).rows[0].notes, ['Visa required', 'Visa not required']);
  assert.equal(compare([alex], 'BAN', sample).issues, 1);
  assert.equal(statuses(compare([alex], 'BOTH', sample).rows[0]), 'Visa on arrival or E-visa');
});

test('Reminder uses phone calendar and clamps to the final day of the target month', () => {
  assert.deepEqual(sixMonthsFrom(new Date(2026, 7, 31, 23)), new Date(2027, 1, 28));
  assert.deepEqual(sixMonthsFrom(new Date(2027, 7, 31)), new Date(2028, 1, 29));
});

test('Citizen entry works without a tourism table and stays scoped to the passport country', () => {
  const data = { US: { homeCountry: 'US', unavailable: true } };
  const home = compare([alex], 'US', data);
  assert.equal(statuses(home.rows[0]), 'Citizen entry');
  assert.equal(home.group, 'Visa-free for everyone');
  assert.equal(home.pending, 0);
  assert.equal(home.rows[0].source, undefined);
  assert.equal(compare([alex], 'AW', data).pending, 1);
  assert.equal(compare([{ passport: 'TW' }], 'TW', data).pending, 1);
});

test('U.S., Japan, Israel and Rwanda trip scenarios resolve the home-passport row', () => {
  const read = path => JSON.parse(readFileSync(new URL(`../site/data/${path}`, import.meta.url)));
  const catalog = read('index.json');
  const data = Object.fromEntries(['US', 'JP', 'IL', 'RW'].map(code => [code, {
    ...catalog.sources[code],
    ...read(`passports/${code}.json`),
    homeCountry: catalog.homeCountries.includes(code) ? code : undefined
  }]));
  const travelers = codes => codes.map(passport => ({ passport, documents: [] }));
  for (const [group, destinations] of [
    [['US', 'JP'], ['US', 'JP']],
    [['US', 'JP', 'IL'], ['US', 'JP', 'IL']],
    [['US', 'JP', 'RW'], ['US', 'JP', 'RW']]
  ]) {
    for (const destination of destinations) {
      const result = compare(travelers(group), destination, data);
      assert.equal(result.pending, 0, `${group.join('/')} traveling to ${destination}`);
      const citizen = result.rows.find(row => row.passenger.passport === destination);
      assert.equal(statuses(citizen), 'Citizen entry');
      assert.equal(citizen.issue, false);
    }
  }
  const rwanda = compare(travelers(['US', 'JP', 'RW']), 'RW', data);
  assert(rwanda.rows.slice(0, 2).every(row => row.options.some(option => ['evisa', 'arrival'].includes(option))));
});
