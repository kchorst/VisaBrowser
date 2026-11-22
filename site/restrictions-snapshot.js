// Nonproduction loader. The caller supplies a trusted version pin and owns cache storage.
import {
  selectBorderRestrictions,
  verifyApprovedRestrictions,
} from './restrictions-bridge.js';

const verifiedSnapshots = new WeakMap();

function freezeJson(value) {
  if (value === null || typeof value !== 'object') return value;
  for (const child of Object.values(value)) freezeJson(child);
  return Object.freeze(value);
}

function verifiedSnapshot(state, dataset, version) {
  const snapshot = Object.freeze({ state, dataset: freezeJson(dataset) });
  verifiedSnapshots.set(snapshot, version);
  return snapshot;
}

async function readApproved(response, version) {
  if (!response?.ok) return null;
  const dataset = await response.json();
  return await verifyApprovedRestrictions(dataset, version) ? dataset : null;
}

export async function loadRestrictionsSnapshot({
  url,
  approvedVersion,
  fetchSnapshot = globalThis.fetch,
  cache,
}) {
  if (typeof approvedVersion !== 'string' || !/^sha256-[a-f0-9]{64}$/.test(approvedVersion)) {
    return { state: 'unavailable', dataset: null };
  }
  const cacheKey = new URL(url, globalThis.location?.href);
  cacheKey.searchParams.set('restrictions-version', approvedVersion);

  try {
    const response = await fetchSnapshot(cacheKey.href, { cache: 'no-store' });
    const dataset = await readApproved(response.clone(), approvedVersion);
    if (dataset) {
      try {
        await cache?.put(cacheKey.href, response);
      } catch {
        // Restricted browser storage must not block use of a verified network response.
      }
      return verifiedSnapshot('online', dataset, approvedVersion);
    }
  } catch {
    // An unavailable endpoint can still have a verified copy for the current pin.
  }

  try {
    const dataset = await readApproved(await cache?.match(cacheKey.href), approvedVersion);
    if (dataset) return verifiedSnapshot('offline', dataset, approvedVersion);
  } catch {
    // Cache access can fail in private browsing or when storage is unavailable.
  }
  return { state: 'unavailable', dataset: null };
}

// Intended for datasets returned by loadRestrictionsSnapshot.
export function getSnapshotBorderNotices(snapshot, destination, context) {
  const version = verifiedSnapshots.get(snapshot);
  if (!version || !snapshot.dataset.destinations.includes(destination)) return [];
  return selectBorderRestrictions(snapshot.dataset, destination, version, context);
}
