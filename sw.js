const CACHE_VERSION = 'rhythm-v5.4.0';
const CORE_ASSETS = ['./', './index.html', './manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => Promise.allSettled(CORE_ASSETS.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (request.mode === 'navigate') {
    e.respondWith(fetch(request).then(r => { const clone = r.clone(); caches.open(CACHE_VERSION).then(c => c.put(request, clone)); return r; }).catch(() => caches.match(request).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(request).then(cached => cached || fetch(request).then(r => { if (r && r.status === 200) { const clone = r.clone(); caches.open(CACHE_VERSION).then(c => c.put(request, clone)); } return r; }).catch(() => cached)));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });