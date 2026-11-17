import { version } from './version.js';
import { readOffline } from './offline.js';

const prefix = 'visabrowser-shell:' + encodeURIComponent(self.registration.scope);
const shell = prefix + ':' + version;
const assets = ['./', './index.html', './app.js', './rules.js', './reviewed.js', './offline.js', './version.js',
  './styles.css', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(shell).then(cache => cache.addAll(
    assets.map(asset => new Request(new URL(asset, self.registration.scope), { cache: 'reload' })))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(prefix + ':') && key !== shell)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  const url = new URL(request.url);
  const path = './' + url.pathname.slice(new URL(self.registration.scope).pathname.length);
  const data = path.startsWith('./data/');
  if (!data && !assets.includes(path)) return;
  event.respondWith((async () => {
    const cache = await caches.open(shell);
    if (!data) {
      const cached = await cache.match(request.mode === 'navigate' ? './index.html' : path);
      return cached || fetch(request);
    }
    const explicitNetwork = request.cache === 'no-store';
    try {
      const response = await fetch(request, { cache: explicitNetwork ? 'no-store' : 'no-cache' });
      if (!response.ok || !response.headers.get('Content-Type')?.includes('json'))
        throw new Error('Rules request did not return JSON');
      if (!explicitNetwork) {
        try { await cache.put(request, response.clone()); } catch { /* storage may be full */ }
      }
      return response;
    } catch {
      if (explicitNetwork) return Response.error();
      const cached = await readOffline(request) ?? await cache.match(request);
      if (!cached) return Response.error();
      const headers = new Headers(cached.headers);
      headers.set('X-VisaBrowser-Cached', 'yes');
      return new Response(cached.body, { headers });
    }
  })());
});
