// Nonproduction loader. The caller supplies a trusted version pin and owns cache storage.
import {
  selectBorderRestrictions,
  verifyApprovedRestrictions,
} from './restrictions-bridge.js';

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
    const response = await fetchSnapshot(cacheKey.href);
    const dataset = await readApproved(response.clone(), approvedVersion);
    if (dataset) {
      try {
        await cache?.put(cacheKey.href, response);
      } catch {
        // Restricted browser storage must not block use of a verified network response.
      }
      return { state: 'online', dataset };
    }
  } catch {
    // An unavailable endpoint can still have a verified copy for the current pin.
  }

  try {
    const dataset = await readApproved(await cache?.match(cacheKey.href), approvedVersion);
    if (dataset) return { state: 'offline', dataset };
  } catch {
    // Cache access can fail in private browsing or when storage is unavailable.
  }
  return { state: 'unavailable', dataset: null };
}

// Intended for datasets returned by loadRestrictionsSnapshot.
export function getSnapshotBorderNotices(snapshot, destination) {
  const dataset = snapshot.dataset;
  if (!dataset?.destinations.includes(destination)) return [];
  return selectBorderRestrictions(dataset, destination, dataset.datasetVersion);
}
