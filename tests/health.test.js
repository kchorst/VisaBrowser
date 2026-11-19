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
  assert.match(notices('2026-11-19T12:00:00Z').at(-1).text, /temporary U.S. Ebola order/);
  assert.equal(notices('2026-12-11T12:00:00Z').length, 2);
  assert.equal(notices('2026-12-19T12:00:00Z').length, 1);
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
  assert.doesNotMatch(healthNotices('SA', 'GH').map(item => item.text).join(' '), /Hajj|Umrah/);
  assert.match(healthNotices('WS', 'FR').at(-1).text, /American Samoa/);
});

test('India lists separate route-based yellow fever and polio checks', () => {
  const [yellow, polio] = healthNotices('IN', 'FR');
  assert.match(yellow.text, /six days/);
  assert.match(polio.text, /both Congos/);
  assert.deepEqual(healthNotices('IN', 'CD'), [yellow, polio]);
});

test('Both Congos show yellow fever proof and separate Ebola screening', () => {
  for (const destination of ['CG', 'CD']) {
    const notices = healthNotices(destination, 'US');
    assert.equal(notices[0].heading, 'Required health documents');
    assert.match(notices[0].text, /arrivals from any country/);
    assert.match(notices.at(-1).heading, /screening/);
    assert.match(notices.at(-1).text, /Ebola/);
  }
  assert.match(healthNotices('CD', 'FR')[1].text, /Polio/);
  assert.match(healthNotices('BT', 'FR')[0].text, /while CDC lists no entry requirement/);
  assert.deepEqual(healthNotices('VN', 'FR'), []);
});


test('U.S. Ebola attestation follows air travel and DRC presence across passports', () => {
  const time = Date.parse('2026-11-19T12:00:00Z');
  const find = passport => healthNotices('US', passport, time).find(({ url }) => url.endsWith('/attestation-order.html'));
  const form = find('US');
  assert.deepEqual(find('FR'), form);
  assert.deepEqual(find('CG'), form);
  assert.match(form.text, /Democratic Republic of the Congo \(Kinshasa\)/);
  assert.match(form.text, /previous 21 days/);
  assert.match(form.text, /airport connection counts/);
  assert.equal(healthNotices('US', 'US', Date.parse('2026-11-03T12:00:00Z'))
    .some(({ url }) => url.endsWith('/attestation-order.html')), false);
});


test('Other Ebola measures retain the destination-specific trigger', () => {
  const time = Date.parse('2026-11-19T12:00:00Z');
  const screening = (destination, date = time) => healthNotices(destination, 'FR', date)
    .find(({ heading }) => heading === 'Health screening and temporary restrictions');
  assert.match(screening('CA').text, /foreign nationals.*21 days/);
  assert.equal(screening('CA', Date.parse('2026-11-28T06:00:00Z')), undefined);
  assert.match(screening('RW').text, /30 days/);
  assert.match(screening('UG').text, /passenger registration/);
  assert.match(screening('CN').text, /symptoms or known contact/);
});
