import assert from 'node:assert/strict';
import { test } from 'node:test';
import { currentHealthNotes, healthNotices } from '../site/health.js';

test('Ghana yellow fever notice applies across passports', () => {
  for (const passport of ['FR', 'GH', 'US', 'X-SOM']) {
    const [notice] = healthNotices('GH', passport);
    assert.equal(notice.heading, 'Required health documents');
    assert.match(notice.text, /9 months or older/);
    assert.equal(notice.url, 'https://evisa.immigration.gov.gh/applicant-guide.html');
  }
});

test('Route-based and dated notices prompt a check without asserting a requirement', () => {
  for (const destination of ['SG', 'BS', 'MT', 'CM']) {
    assert.equal(healthNotices(destination, 'GH')[0].heading, 'Check health documents');
  }
  assert.match(healthNotices('SG', 'FR')[0].text, /transit over 12 hours/);
});

test('Polio and Jamaica visa-waiver checks are scoped to the covered pathway', () => {
  for (const passport of ['AF', 'MG', 'PK', 'YE']) {
    assert.match(healthNotices('RO', passport)[0].text, /polio/);
  }
  assert.deepEqual(healthNotices('RO', 'US'), []);
  assert.equal(healthNotices('CA', 'PK')[0].heading, 'Departure health documents');
  assert.match(healthNotices('JM', 'KZ')[1].text, /measles, rubella and polio/);
  assert.equal(healthNotices('JM', 'FR').length, 1);
});

test('Symptom screening remains separate and an expiring order drops off', () => {
  const notices = date => healthNotices('US', 'UG', Date.parse(date));
  assert.match(notices('2026-11-19T12:00:00Z')[0].text, /fever with persistent cough/);
  assert.match(notices('2026-11-19T12:00:00Z')[1].text, /Ebola/);
  assert.equal(notices('2026-12-11T12:00:00Z').length, 1);
});

test('Remove obsolete U.S. vaccine instructions without removing unrelated notes', () => {
  const notes = ['Proof of COVID-19 vaccine required if entering by air.', 'Carry your visa.'];
  assert.deepEqual(currentHealthNotes(notes, 'US'), ['Carry your visa.']);
  assert.deepEqual(currentHealthNotes(notes, 'CA'), notes);
});
