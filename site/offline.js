const scope = new URL('./', import.meta.url);
const key = encodeURIComponent(scope.pathname);
const metaCache = `visabrowser-offline-meta:${key}`;
const packPrefix = `visabrowser-offline-pack:${key}:`;
const activeKey = new URL('./data/__active-offline-pack', scope);
const manifestUrl = new URL('./data/offline-manifest.json', scope);

export async function offlineStatus() {
  const cache = await caches.open(metaCache);
  const response = await cache.match(activeKey);
  return response ? response.json() : null;
}

export async function readOffline(url) {
  const active = await offlineStatus();
  if (!active || !(await caches.has(active.cache))) return undefined;
  return (await caches.open(active.cache)).match(url);
}

async function online(url) {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout?.(30000) });
  if (!response.ok || response.headers.get('X-VisaBrowser-Cached') === 'yes')
    throw new Error('Could not reach the current published dataset');
  return response;
}

export async function onlineManifest() {
  const manifest = await (await online(manifestUrl)).json();
  if (!validManifest(manifest)) throw new Error('Invalid dataset manifest');
  return manifest;
}

function validManifest(manifest) {
  return /^[a-f0-9]{64}$/.test(manifest?.version ?? '') &&
    typeof manifest.generated === 'string' && Number.isFinite(Date.parse(manifest.generated)) &&
    manifest.files && typeof manifest.files === 'object' &&
    ['index.json', 'places.json'].every(name => name in manifest.files) &&
    Object.entries(manifest.files).every(([name, hash]) =>
      /^(?:index\.json|places\.json|passports\/[A-Z-]+\.json)$/.test(name) && /^[a-f0-9]{64}$/.test(hash));
}

async function sha256(bytes) {
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, '0')).join('');
}

export async function saveOffline(onProgress) {
  const operation = async () => {
    const manifest = await onlineManifest();
    const original = await offlineStatus();
    const name = packPrefix + crypto.randomUUID();
    const staging = await caches.open(name);
    const files = Object.entries(manifest.files);
    let downloaded = 0;
    let cursor = 0;
    async function fetchFiles() {
      while (cursor < files.length) {
        const [file, checksum] = files[cursor++];
        const url = new URL(`./data/${file}`, scope);
        const response = await online(url);
        const bytes = await response.arrayBuffer();
        if (await sha256(bytes) !== checksum) throw new Error(`Integrity check failed for ${file}`);
        await staging.put(url, new Response(bytes, { headers: { 'Content-Type': 'application/json' } }));
        onProgress(++downloaded, files.length);
      }
    }
    const work = await Promise.allSettled(Array.from({ length: 6 }, fetchFiles));
    try {
      const rejected = work.find(result => result.status === 'rejected');
      if (rejected) throw rejected.reason;
      const latest = await onlineManifest();
      if (manifest.version !== latest.version) throw new Error('A new dataset was published during download');
      const active = { cache: name, version: manifest.version, generated: manifest.generated };
      const pointers = await caches.open(metaCache);
      await pointers.put(activeKey, new Response(JSON.stringify(active)));
      if (original?.cache && navigator.locks) await caches.delete(original.cache).catch(() => {});
      return active;
    } catch (error) {
      await caches.delete(name);
      throw error;
    }
  };
  return navigator.locks ? navigator.locks.request(metaCache, operation) : operation();
}
