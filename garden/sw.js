/* Meadowlark service worker — offline-first, cache the shell. No push, no notifications, ever. */
const CACHE = 'meadowlark-garden-v65';
const ASSETS = ['.', 'index.html', 'manifest.json', 'icon.svg', 'icon-maskable.svg', 'craft-index.json', 'fable-animals.js',
  'icons/apple-touch-icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'fonts/figtree-400-latin.woff2', 'fonts/figtree-400-latinext.woff2', 'fonts/figtree-500-latin.woff2', 'fonts/figtree-500-latinext.woff2',
  'fonts/figtree-600-latin.woff2', 'fonts/figtree-600-latinext.woff2', 'fonts/figtree-700-latin.woff2', 'fonts/figtree-700-latinext.woff2',
  'fonts/hankengrotesk-400-latin.woff2', 'fonts/hankengrotesk-400-latinext.woff2', 'fonts/hankengrotesk-500-latin.woff2', 'fonts/hankengrotesk-500-latinext.woff2',
  'fonts/hankengrotesk-600-latin.woff2', 'fonts/hankengrotesk-600-latinext.woff2', 'fonts/hankengrotesk-700-latin.woff2', 'fonts/hankengrotesk-700-latinext.woff2',
  'fonts/spacegrotesk-500-latin.woff2', 'fonts/spacegrotesk-500-latinext.woff2', 'fonts/spacegrotesk-600-latin.woff2', 'fonts/spacegrotesk-600-latinext.woff2',
  'splash/splash-750x1334.png', 'splash/splash-1242x2208.png', 'splash/splash-1125x2436.png', 'splash/splash-828x1792.png',
  'splash/splash-1242x2688.png', 'splash/splash-1170x2532.png', 'splash/splash-1179x2556.png', 'splash/splash-1284x2778.png',
  'splash/splash-1290x2796.png', 'splash/splash-1536x2048.png', 'splash/splash-1668x2388.png', 'splash/splash-2048x2732.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  // {cache:'reload'} bypasses the HTTP cache so a fresh CACHE always gets fresh files from the network,
  // never a stale sidecar the browser happened to be holding. Per-file so one 404 can't sink the whole install.
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(
    ASSETS.map(a => fetch(new Request(a, { cache: 'reload' }))
      .then(r => { if (r && (r.ok || r.type === 'opaque')) return c.put(a, r); })
      .catch(() => {})
    )
  )).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;

  // network-first for our own HTML so updates land; fall back to cache offline
  if (req.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }

  // cross-origin (e.g. the one-time Supabase craft-steps lookup): pass through, fall back to cache offline
  if (!sameOrigin) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // same-origin sidecars (js/json/icons/fonts/splash/manifest): stale-while-revalidate.
  // Serve the cached copy immediately for speed; revalidate in the background so a new deploy's sidecar
  // is picked up on the next load. Offline still falls back to whatever is cached.
  e.respondWith(
    caches.open(CACHE).then(cache => cache.match(req).then(cached => {
      const fetched = fetch(req).then(res => {
        if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
        return res;
      }).catch(() => cached);
      return cached || fetched;
    }))
  );
});
