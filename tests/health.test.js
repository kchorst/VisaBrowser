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

test('Mainland China describes the same itinerary trigger across passports', () => {
  const [notice] = healthNotices('CN', 'SS');
  assert.deepEqual(healthNotices('CN', 'RW')[0], notice);
  assert.deepEqual(healthNotices('CN', 'FR')[0], notice);
  assert.match(notice.text, /aged 9 months or older/);
  assert.match(notice.text, /transit over 12 hours/);
  assert.match(notice.text, /South Sudan is a risk country/);
  assert.match(notice.text, /Rwanda has low transmission potential/);
});

test('Published historical triggers are visible without assuming passport means origin', () => {
  const [route] = healthNotices('TH', 'FR');
  assert.deepEqual(healthNotices('TH', 'GH')[0], route);
  assert.match(route.text, /aged 9 months or over/);
  assert.match(route.text, /transit of more than 12 hours/);
  assert.match(route.url, /#page=42$/);
  const [all] = healthNotices('CM', 'FR');
  assert.match(all.text, /arrivals from any country/);
  assert.equal(all.heading, 'Check health documents');
  assert.deepEqual(healthNotices('BR', 'FR'), []);
});

test('Jamaica reflects both vaccine-proof waiver groups', () => {
  for (const passport of 'AL BA BG BY HR KZ MD ME MK RO RS'.split(' ')) {
    assert.match(healthNotices('JM', passport)[1].text, /qualifying U.S., Canadian, UK or Schengen visa/);
  }
  for (const passport of ['EE', 'LT', 'LV', 'SI']) {
    assert.doesNotMatch(healthNotices('JM', passport)[1].text, /qualifying/);
  }
});

test('Nepal and Egypt polio notices follow the route across passports', () => {
  for (const destination of ['NP', 'EG']) {
    const notice = healthNotices(destination, 'FR').find(({ text }) => /polio/i.test(text));
    assert.deepEqual(healthNotices(destination, 'GH').find(({ text }) => /polio/i.test(text)), notice);
    assert.match(notice.text, /four weeks/);
  }
  assert.match(healthNotices('SA', 'GH').at(-1).text, /COVID-19 vaccination or immunity/);
  assert.match(healthNotices('WS', 'FR').at(-1).text, /American Samoa/);
});
