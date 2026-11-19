import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditFindings } from '../site/tourist-audit.js';
import { touristDetails, touristEntryTerms } from '../site/tourist.js';
import { compare } from '../site/rules.js';

const traveler = (passport, options = ['free']) => ({ passenger: { passport }, options });

test('Onward proof and transit conditions keep their route qualifiers', () => {
  assert.match(touristDetails('TH', traveler('US'))[0].text, /30-day tourist visa exemption/);
  assert.match(touristDetails('CR', traveler('US'))[0].text, /bus or flight.*cruise/);
  assert.match(touristDetails('SG', traveler('US'))[1].text, /baggage/);
  assert.match(touristDetails('FR', traveler('US'))[0].text, /may request/);
  assert.deepEqual(touristDetails('TH', { ...traveler('TH'), home: true }), []);
});

test('Tourist eVisa validity, entries and permitted stay are separate', () => {
  const terms = touristEntryTerms('VN', traveler('US', ['evisa']));
  assert.match(terms.entries, /single or multiple/);
  assert.match(terms.validity, /90 days/);
  assert.match(terms.stay, /permitted date/);
  assert.equal(touristEntryTerms('VN', traveler('US')), null);
});

test('All 2,930 P1 pairs are represented and scoped to the passport', () => {
  assert.equal(Object.values(auditFindings).reduce((n, map) => n + Object.keys(map).length, 0), 2930);
  assert.match(touristDetails('IL', traveler('AL')).at(-1).text, /ETA-IL/);
  assert.equal(auditFindings.IL.AE.heading, 'Confirm entry details');
  assert.ok(auditFindings.IL.AL.more.length);
});

test('Romania to the U.S. uses the visitor visa rule without imported ESTA details', () => {
  const baseline = { options: ['advance'], flags: ['Electronic travel authorization'], fee: '$30', notes: ['ESTA required'] };
  const result = compare([{ passport: 'RO' }], 'US', { RO: { rules: { US: baseline } } });
  assert.deepEqual(result.rows[0].options, ['advance']);
  assert.equal(result.rows[0].fee, undefined);
  assert.equal(result.rows[0].flags, undefined);
  assert.doesNotMatch(result.rows[0].notes.join(' '), /ESTA/);
});

test('Australia treats eVisitor as a visa for Bulgarian and Romanian passports', () => {
  for (const passport of ['BG', 'RO']) {
    const result = compare([{ passport }], 'AU', {});
    assert.deepEqual(result.rows[0].options, ['evisa']);
    assert.match(result.rows[0].status, /651/);
  }
});
