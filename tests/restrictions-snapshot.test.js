import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadRestrictionsSnapshot, getSnapshotBorderNotices, getSnapshotBorderNoticeResult } from '../site/restrictions-snapshot.js';

const fixture = JSON.parse(readFileSync(
  new URL('./fixtures/approved-restrictions-snapshot.json', import.meta.url), 'utf8',
));
const url = 'https://example.invalid/restrictions.json';
const approvedVersion = fixture.datasetVersion;

function memoryCache() {
  const responses = new Map();
  return {
    async put(key, response) { responses.set(key, response.clone()); },
    async match(key) { return responses.get(key)?.clone(); },
  };
}

const offline = async () => { throw new Error('Network unavailable'); };

test('online and offline consume the actual Travel-Prep format and preserve territory scope', async () => {
  const cache = memoryCache();
  const online = await loadRestrictionsSnapshot({
    url, approvedVersion, cache,
    fetchSnapshot: async () => Response.json(fixture),
  });
  assert.equal(online.state, 'online');
  const cached = await loadRestrictionsSnapshot({ url, approvedVersion, cache, fetchSnapshot: offline });
  assert.equal(cached.state, 'offline');
  assert.deepEqual(getSnapshotBorderNotices(cached, 'TEST-MAINLAND'), []);
  assert.deepEqual(getSnapshotBorderNotices(cached, 'UNKNOWN'), []);
  assert.deepEqual(getSnapshotBorderNotices(cached, 'TEST-TERRITORY').map(({ id }) => id),
    ['synthetic-territory-customs']);
});

test('a missing, old or tampered snapshot never supplies border notices', async () => {
  const cache = memoryCache();
  const snapshot = structuredClone(fixture);
  snapshot.records[0].title += ' tampered';
  const tampered = await loadRestrictionsSnapshot({
    url, approvedVersion, cache, fetchSnapshot: async () => Response.json(snapshot),
  });
  assert.deepEqual(tampered, { state: 'unavailable', dataset: null });
  const stale = await loadRestrictionsSnapshot({
    url, approvedVersion: 'sha256-' + '0'.repeat(64),
    cache: { match: async () => Response.json(fixture) }, fetchSnapshot: offline,
  });
  assert.equal(stale.state, 'unavailable');
  assert.deepEqual(getSnapshotBorderNotices(stale, 'TEST-TERRITORY'), []);
  const unpinned = await loadRestrictionsSnapshot({ url, approvedVersion: null, cache });
  assert.equal(unpinned.state, 'unavailable');
});

test('storage failure preserves a verified network result', async () => {
  const result = await loadRestrictionsSnapshot({
    url, approvedVersion, cache: { put: offline }, fetchSnapshot: async () => Response.json(fixture),
  });
  assert.equal(result.state, 'online');
});

test('invalid endpoints fail closed without touching the network or cache', async () => {
  const unexpectedAccess = () => assert.fail('Invalid endpoint was requested');
  for (const endpoint of [undefined, '', 'http://[', 'file:///restrictions.json', 'https://a:b@example.invalid']) {
    assert.deepEqual(await loadRestrictionsSnapshot({
      url: endpoint, approvedVersion, fetchSnapshot: unexpectedAccess,
      cache: { match: unexpectedAccess, put: unexpectedAccess },
    }), { state: 'unavailable', dataset: null });
  }
});

test('passport- and arrival-specific notices require both matches', async () => {
  const snapshot = await loadRestrictionsSnapshot({
    url, approvedVersion, fetchSnapshot: async () => Response.json(fixture),
  });
  const ids = (context) =>
    getSnapshotBorderNotices(snapshot, 'TEST-TERRITORY', context).map(({ id }) => id);
  const unscoped = ['synthetic-territory-customs'];
  assert.deepEqual(ids(), unscoped);
  assert.deepEqual(ids({ passportCode: 'GB' }), unscoped);
  assert.deepEqual(ids({ passportCode: 'US', arrivalMode: 'air' }), unscoped);
  assert.deepEqual(ids({ passportCode: 'GB', arrivalMode: 'land' }), unscoped);
  assert.deepEqual(ids({ passportCode: 'GB', arrivalMode: 'air' }),
    [...unscoped, 'synthetic-territory-scoped']);
});

test('selectors use only verified loader results and verified records are immutable', async () => {
  const options = { url, approvedVersion, fetchSnapshot: async () => Response.json(fixture) };
  const loaded = await loadRestrictionsSnapshot(options);
  assert.equal(loaded.state, 'online');
  assert.deepEqual(getSnapshotBorderNotices({ state: 'online', dataset: fixture }, 'TEST-TERRITORY'), []);
  assert.deepEqual(getSnapshotBorderNotices({ ...loaded }, 'TEST-TERRITORY'), []);
  assert.deepEqual(getSnapshotBorderNotices(null, 'TEST-TERRITORY'), []);
  const [notice] = getSnapshotBorderNotices(loaded, 'TEST-TERRITORY');
  assert.throws(() => { notice.rule = 'Unapproved edit'; }, TypeError);
  assert.throws(() => { notice.sources[0].url = 'https://example.invalid/changed'; }, TypeError);
  assert.throws(() => { loaded.dataset.records = []; }, TypeError);
  assert.equal(getSnapshotBorderNotices(loaded, 'TEST-TERRITORY')[0].rule, notice.rule);
});

test('results distinguish unavailable data, missing territory and no matching notices', async () => {
  const cache = memoryCache();
  const options = { url, approvedVersion, cache };
  await loadRestrictionsSnapshot({ ...options, fetchSnapshot: async () => Response.json(fixture) });
  const cached = await loadRestrictionsSnapshot({ ...options, fetchSnapshot: offline });
  const unavailable = await loadRestrictionsSnapshot({ ...options, approvedVersion: null });
  for (const [snapshot, destination, status, source] of [
    [unavailable, 'TEST-TERRITORY', 'unavailable', null],
    [cached, 'UNKNOWN', 'destination_not_covered', 'offline'],
    [cached, 'TEST-MAINLAND', 'no_matching_notices', 'offline'],
  ]) {
    assert.deepEqual(getSnapshotBorderNoticeResult(snapshot, destination), { status, source, notices: [] });
  }
  const result = getSnapshotBorderNoticeResult(cached, 'TEST-TERRITORY');
  assert.equal(result.status, 'notices');
  assert.equal(result.source, 'offline');
  assert.equal(result.notices.length, 1);
});
