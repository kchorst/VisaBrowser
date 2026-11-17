import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test, mock } from 'node:test';
import { compare, noAdvanceVisa, rank, statuses } from '../site/rules.js';

const read = name => JSON.parse(readFileSync(new URL(`../site/data/${name}`, import.meta.url)));
const index = read('index.json');
mock.method(Date, 'now', () => Date.parse(index.generated));
const passports = ['XK', 'PS', 'AF', 'SN', 'CD', 'CG', 'IR', 'RU', 'BY', 'HT', 'TM', 'CN', 'US', 'JP', 'BR', 'IL', 'RW'];
const loadPassport = passport => ({
  ...index.sources[passport],
  ...(index.sources[passport]?.lastSuccess ? read(`passports/${passport}.json`) : {}),
  homeCountry: index.homeCountries.includes(passport) ? passport : undefined
});
const data = Object.fromEntries(passports.map(passport => [passport, loadPassport(passport)]));
const person = (passport, facts = {}, documents = []) => ({ passport, facts, documents });
const result = (passenger, place) => compare([passenger], place, data);
const row = (passenger, place) => result(passenger, place).rows[0];
const status = (passenger, place) => row(passenger, place).options[0];
const doc = (issuer, fields) => ({ id: issuer, issuer, ...fields });

test('Brazil and U.S. visitors have different visa routes in each direction', () => {
  const group = ['BR', 'US'].map(code => person(code));
  assert.deepEqual(compare(group, 'BR', data).rows.map(statuses), ['Citizen entry', 'E-visa']);
  assert.deepEqual(compare(group, 'US', data).rows.map(statuses), ['Visa required before travel', 'Citizen entry']);
});

test('Brazil traveler results expose authorizations, applicable stay limits, and the Japan passport exception', () => {
  const brazilian = person('BR');
  for (const [place, flag] of [['NZ', /NZeTA/], ['IL', /ETA-IL/], ['KN', /eTA/], ['AW', /ED Card/]]) {
    const current = row(brazilian, place);
    assert.deepEqual(current.options, ['free']);
    assert.match(current.flags.join(' '), flag);
    assert(current.official);
    assert(current.routes.length);
  }
  assert.match(row(brazilian, 'NZ').stay, /3 months.*6 months in any 12 months/);
  assert.equal(status(person('BR', {}, [doc('AU', { type: 'permit', qualifications: { NZ: true } })]), 'NZ'), 'residentArrival');
  assert.equal(status(person('BR', {}, [doc('AU', { type: 'permit' })]), 'NZ'), 'free');
  assert.equal(status(person('XK'), 'KN'), 'pending');
  assert.match(row(person('XK'), 'BR').notes[0], /special consular category/);
  for (const place of ['NO', 'RO', 'BG']) {
    assert.equal(row(brazilian, place).stay, '90 days in any 180 days across Schengen');
    assert(row(brazilian, place).cumulative);
  }
  for (const [passport, place] of [['BR', 'JP'], ['JP', 'BR']]) {
    assert.equal(status(person(passport), place), 'pending');
    assert.equal(status(person(passport, { 'br-jp:epassport': 'no' }), place), 'advance');
    assert.equal(status(person(passport, { 'br-jp:epassport': 'yes' }), place), 'free');
  }
});

test('China and Brazil display reciprocal waiver deadlines and keep mainland tourism separate from transit', () => {
  const mainland = row(person('BR'), 'CN');
  assert.equal(mainland.stay, 'Up to 30 days');
  assert.match(mainland.condition, /December 31, 2026/);
  assert.doesNotMatch(mainland.condition, /transit/i);
  const toBrazil = row(person('CN'), 'BR');
  assert.match(toBrazil.stay, /30 days total in 12 months/);
  assert.match(toBrazil.condition, /December 31, 2026/);
  assert.equal(status(person('BR', { 'china:route': '24h', 'china:transit:24h': 'yes', 'china:stay-airside': 'yes' }), 'CN'), 'transit');
  for (const [passport, place, midnight] of [
    ['BR', 'CN', '2027-01-01T00:00:00+08:00'], ['CN', 'BR', '2027-01-01T00:00:00-03:00']
  ]) {
    Date.now.mock.mockImplementationOnce(() => Date.parse(midnight) - 1);
    assert.equal(status(person(passport), place), 'free');
    Date.now.mock.mockImplementationOnce(() => Date.parse(midnight));
    const expired = row(person(passport), place);
    assert.deepEqual(expired.options, ['pending']);
    assert.match(expired.search, /renewal/);
  }
});

test('Every bundled passport–destination pair produces a usable result and pending research', () => {
  const all = Object.fromEntries(index.passports.map(code => [code, loadPassport(code)]));
  for (const passport of index.passports) {
    for (const place of index.destinations) {
      const current = compare([person(passport)], place, all);
      const [item] = current.rows;
      const key = `${passport} → ${place}`;
      assert(item.options.length && statuses(item), key);
      if (current.pending) {
        assert(item.reason && !current.group && !noAdvanceVisa(current), key);
      }
    }
  }
  for (const [passport, place] of [['ID', 'CN'], ['IL', 'IR'], ['KR', 'IR'], ['MO', 'CN'], ['MX', 'CN'], ['UA', 'CN']]) {
    const [item] = compare([person(passport)], place, all).rows;
    assert.deepEqual(item.options, ['pending']);
    assert(item.search && item.official && item.controls.length);
  }
});

test('South Africa distinguishes false ETA greens, denied waiver, and uncertain ports', () => {
  const mixed = compare(['PS', 'AF', 'CG', 'HT', 'TM'].map(code => person(code)), 'ZA', data);
  assert.equal(mixed.group, '');
  assert.equal(mixed.pending, 4);
  assert.equal(mixed.issues, 1);
  assert(!noAdvanceVisa(mixed));
  for (const option of mixed.rows.filter(person => person.options.includes('pending'))) {
    assert.match(option.search, /ETA eligible/);
    assert(option.official);
  }
  const chinese = row(person('CN'), 'ZA');
  assert.deepEqual(chinese.routes.map(x => x.title), ['South African ETA', 'South African e-visa']);
  assert.equal(chinese.options[0], 'pending');
  assert.equal(status(person('CN', { 'za:port': 'yes' }), 'ZA'), 'evisa');
  assert.equal(status(person('CD'), 'ZA'), 'pending');
  assert.equal(status(person('CD', { 'za:evisa-port': 'yes' }), 'ZA'), 'evisa');
  assert.match(row(person('CD', { 'za:evisa-port': 'yes' }), 'ZA').condition, /Tambo/);
});

test('Schengen checks biometrics, scope, expiration, and remaining entries', () => {
  for (const place of ['NO', 'RO', 'BG']) {
    assert.equal(status(person('XK'), place), 'pending');
    assert.equal(status(person('XK', { 'kosovo:biometric': 'no' }), place), 'advance');
    const biometric = row(person('XK', { 'kosovo:biometric': 'yes' }), place);
    assert.equal(biometric.options[0], 'free');
    assert.match(biometric.stay, /90 days in any 180 days across Schengen/);
    const visa = { type: 'visa', valid: true, schengenScope: 'uniform', schengenEntry: 'yes' };
    assert.equal(status(person('PS', {}, [doc('FR', visa)]), place), 'existing');
    assert.equal(status(person('PS', {}, [doc('FR', { ...visa, valid: false })]), place), 'advance');
    assert.equal(status(person('PS', {}, [doc('FR', { ...visa, schengenScope: 'transit' })]), place), 'advance');
    assert.equal(status(person('PS', {}, [doc('FR', { ...visa, schengenScope: 'limited' })]), place), 'pending');
    assert.equal(status(person('PS', {}, [doc('FR', { ...visa, schengenScope: 'limited', qualifications: { [place]: false } })]), place), 'advance');
    assert.equal(status(person('PS', {}, [doc('FR', { ...visa, schengenEntry: 'no' })]), place), 'advance');
  }
  assert.equal(status(person('RU', {}, [doc('FR', { type: 'visa', valid: true, schengenScope: 'uniform', schengenEntry: 'yes' })]), 'NO'), 'denied');
  assert.equal(status(person('RU', {}, [doc('FR', { type: 'permit', valid: true, schengenEntry: 'yes' })]), 'NO'), 'existing');
  assert.equal(status(person('BY'), 'NO'), 'advance');
});

test('New Zealand checks passport recognition before any residency exception', () => {
  const permanent = doc('AU', { type: 'permit', qualifications: { NZ: true } });
  const temporary = doc('AU', { type: 'permit', qualifications: { NZ: false } });
  const ordinary = row(person('SN'), 'NZ');
  assert.equal(ordinary.options[0], 'advance');
  assert.equal(ordinary.flags, undefined);
  assert.equal(status(person('SN', {}, [temporary]), 'NZ'), 'advance');
  assert.equal(status(person('SN', {}, [doc('AU', { type: 'permit' })]), 'NZ'), 'pending');
  assert.equal(status(person('SN', {}, [permanent]), 'NZ'), 'residentArrival');
  assert.equal(status(person('AF', {}, [permanent]), 'NZ'), 'pending');
  assert.equal(status(person('AF', { 'af-nz:authority': 'emirate' }, [permanent]), 'NZ'), 'denied');
  assert.equal(status(person('AF', { 'af-nz:authority': 'republic', 'af-nz:year': 'after' }), 'NZ'), 'denied');
  assert.equal(status(person('AF', { 'af-nz:authority': 'republic', 'af-nz:year': 'recognized' }, [permanent]), 'NZ'), 'residentArrival');
  assert.equal(status(person('RU'), 'NZ'), 'advance');
  assert.equal(status(person('CN'), 'NZ'), 'advance');
});

test('Svalbard, Jan Mayen, and Kosovo’s St Kitts case stay distinct', () => {
  assert.equal(read('places.json').SJ, 'Svalbard');
  assert.equal(read('places.json')['X-JAN'], 'Jan Mayen');
  assert.equal(status(person('SN'), 'NO'), 'advance');
  assert.equal(status(person('SN'), 'SJ'), 'pending');
  assert.equal(status(person('SN', { 'svalbard:route': 'no' }), 'SJ'), 'free');
  const via = row(person('SN', { 'svalbard:route': 'twice' }), 'SJ');
  assert.equal(via.options[0], 'pending');
  assert.match(via.reason, /two Schengen entries/);
  assert.equal(status(person('SN', { 'svalbard:route': 'twice', 'svalbard:entries': 'yes' },
    [doc('FR', { type: 'visa', valid: true, schengenScope: 'uniform', schengenEntry: 'yes' })]), 'SJ'), 'existing');
  assert.equal(status(person('SN'), 'X-JAN'), 'permit');
  assert.equal(status(person('XK'), 'KN'), 'pending');
  assert.match(row(person('XK'), 'KN').search, /Kosovo.*eTA e-visa/);
});

test('Russia, Iran, Belarus and Turkmenistan keep conditional routes separate', () => {
  assert.equal(status(person('IR'), 'RU'), 'pending');
  assert.equal(status(person('IR', { 'ru:ports': 'yes' }), 'RU'), 'evisa');
  assert.equal(status(person('IR', { 'ru-ir:tour-group': 'yes' }), 'RU'), 'free');
  assert.equal(status(person('RU'), 'IR'), 'pending');
  assert.equal(status(person('RU', { 'ru-ir:tour-group': 'yes' }), 'IR'), 'free');
  assert.equal(status(person('RU', { 'ru-ir:tour-group': 'yes', 'iran:route': 'kish' }), 'IR'), 'pending');
  for (const [place, issuer] of [['RU', 'BY'], ['BY', 'RU']]) {
    for (const extra of ['PS', 'HT']) {
      assert.equal(status(person(extra, {}, [doc(issuer, { type: 'visa' })]), place), 'pending');
      assert.equal(status(person(extra, {}, [doc(issuer, { type: 'visa', qualifications: { [place]: true } })]), place), 'existing');
      assert.notEqual(status(person(extra, {}, [doc(issuer, { type: 'visa', qualifications: { [place]: false } })]), place), 'existing');
    }
  }
  assert.equal(status(person('US'), 'BY'), 'pending');
  assert.equal(status(person('US', { 'by:evisa-route': 'yes' }), 'BY'), 'evisa');
  for (const c of ['HT', 'PS', 'IR', 'CN', 'AF', 'RU', 'BY', 'US', 'SN', 'CD', 'CG', 'XK']) {
    assert.equal(status(person(c), 'TM'), 'pending');
    assert.match(row(person(c), 'TM').search, /invitation/);
  }
});

test('China tourism, regional stays, and its two transit paths do not bleed into each other', () => {
  assert.equal(status(person('TM'), 'CN'), 'advance');
  assert.equal(status(person('TM', { 'china:tm-tour': 'yes' }), 'CN'), 'free');
  assert.equal(status(person('AF'), 'CN'), 'advance');
  assert.equal(status(person('AF', { 'china:route': '24h', 'china:transit:24h': 'yes', 'china:stay-airside': 'yes' }), 'CN'), 'transit');
  const switched = row(person('US', { 'china:route': '240h', 'china:transit:24h': 'yes', 'china:approved-ports': 'yes' }), 'CN');
  assert.equal(switched.options[0], 'pending');
  const transit = result(person('US', { 'china:route': '240h', 'china:transit:240h': 'yes', 'china:approved-ports': 'yes' }), 'CN');
  assert.equal(transit.group, '');
  assert(!noAdvanceVisa(transit));
  assert.equal(status(person('US', { 'china:route': '240h', 'china:transit:240h': 'yes', 'china:approved-ports': 'yes' }), 'CN'), 'transit');
  const exitsPort = row(person('AF', { 'china:route': '24h', 'china:transit:24h': 'yes', 'china:stay-airside': 'no' }), 'CN');
  assert.equal(exitsPort.options[0], 'pending');
  assert.match(exitsPort.reason, /temporary entry permit/);
  assert.equal(status(person('US'), 'X-HAINAN'), 'pending');
  assert.equal(status(person('US', { 'china:hainan': 'yes' }), 'X-HAINAN'), 'free');
  assert.equal(status(person('PS', { 'china:hainan': 'yes' }), 'X-HAINAN'), 'pending');
  assert.equal(status(person('HT'), 'HK'), 'free');
  assert.equal(status(person('HT'), 'CN'), 'advance');
});

test('Haiti, U.S. restrictions, and overdue data provide actionable differences', () => {
  assert(row(person('CN'), 'HT').flags.some(flag => flag.includes('iKat')));
  for (const nationality of ['HT', 'AF', 'PS', 'IR', 'CG', 'SN']) {
    assert.equal(status(person(nationality), 'US'), 'pending');
    assert.equal(status(person(nationality, { 'us:effective-visa': 'yes' }), 'US'), 'existing');
    assert.equal(status(person(nationality,
      { 'us:effective-visa': 'no', 'us:outside': 'yes', 'us:exception': 'no' }), 'US'), 'denied');
  }
  assert.equal(status(person('TM'), 'US'), 'advance');
  assert.equal(status(person('CD'), 'US'), 'advance');
  Date.now.mock.mockImplementationOnce(() => Date.parse(index.generated) + 15 * 86400000);
  const overdue = row(person('US'), 'AW');
  assert.equal(overdue.options[0], 'pending');
  assert.match(overdue.reason, /overdue/);
});

test('Audited matrix stays order-independent and pending never produces a green group', () => {
  const group = passports.map(passport => person(passport));
  const places = ['NO', 'RO', 'BG', 'ZA', 'KN', 'NZ', 'SJ', 'X-JAN', 'US', 'BR', 'IR', 'RU', 'BY', 'HT', 'TM', 'CN', 'X-HAINAN'];
  for (const place of places) {
    for (let i = 0; i < group.length; i++) {
      const passengers = [group[i], group[(i * 3 + 2) % group.length], group[(i + 5) % group.length]];
      const first = compare(passengers, place, data);
      const reverse = compare([...passengers].reverse(), place, data);
      assert.deepEqual([first.group, first.pending, first.issues], [reverse.group, reverse.pending, reverse.issues]);
      if (first.pending) {
        assert.equal(first.group, '');
        assert(!noAdvanceVisa(first));
        for (const item of first.rows.filter(item => item.options.includes('pending'))) assert(item.reason);
      }
    }
  }
  const usa = person('HT', { 'us:effective-visa': 'yes' });
  assert.equal(rank([['US', 'United States']], [usa], data)[0].heading, 'No conventional advance visa needed');
  assert.equal(statuses(row(person('SN'), 'X-JAN')), 'Prior permission required*');
});

test('Brazil mixed groups complete across the destinations from the audit', () => {
  const places = ['BR', 'US', 'NO', 'RO', 'BG', 'ZA', 'KN', 'NZ', 'SJ', 'X-JAN', 'IR', 'RU', 'BY', 'HT', 'TM',
    'CN', 'X-HAINAN', 'RW', 'AR', 'AW', 'JP', 'IL'];
  const others = passports.filter(code => code !== 'BR');
  for (const place of places) {
    for (const [i, first] of others.entries()) {
      const passengers = ['BR', first, others[(i + 1) % others.length]].map(code => person(code));
      const result = compare(passengers, place, data);
      const reverse = compare([...passengers].reverse(), place, data);
      assert.deepEqual([result.group, result.pending, result.issues], [reverse.group, reverse.pending, reverse.issues]);
      if (result.pending) assert(!result.group && !noAdvanceVisa(result));
    }
  }
});
