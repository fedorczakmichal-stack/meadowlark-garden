/* Meadowlark service worker — offline-first, cache the shell. No push, no notifications, ever. */
const CACHE = 'meadowlark-garden-v55';
const ASSETS = ['.', 'index.html', 'manifest.json', 'icon.svg', 'icon-maskable.svg', 'craft-index.json', 'fable-animals.js',
  'icons/apple-touch-icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'fonts/figtree-400-latin.woff2', 'fonts/figtree-400-latinext.woff2', 'fonts/figtree-500-latin.woff2', 'fonts/figtree-500-latinext.woff2',
  'fonts/figtree-600-latin.woff2', 'fonts/figtree-600-latinext.woff2', 'fonts/figtree-700-latin.woff2', 'fonts/figtree-700-latinext.woff2',
  'fonts/hankengrotesk-400-latin.woff2', 'fonts/hankengrotesk-400-latinext.woff2', 'fonts/hankengrotesk-500-latin.woff2', 'fonts/hankengrotesk-500-latinext.woff2',
  'fonts/hankengrotesk-600-latin.woff2', 'fonts/hankengrotesk-600-latinext.woff2', 'fonts/hankengrotesk-700-latin.woff2', 'fonts/hankengrotesk-700-latinext.woff2',
  'fonts/spacegrotesk-500-latin.woff2', 'fonts/spacegrotesk-500-latinext.woff2', 'fonts/spacegrotesk-600-latin.woff2', 'fonts/spacegrotesk-600-latinext.woff2'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
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
  // network-first for our own HTML so updates land; cache-first for everything else
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
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && res.status === 200 && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => cached))
  );
});
