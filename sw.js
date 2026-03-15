const CACHE = 'notiva-v5';
const ASSETS = [
  '/Notiva-Notes/',
  '/Notiva-Notes/index.html',
  '/Notiva-Notes/manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap'
];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => e.respondWith(
  caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(res => {
      if (!res || res.status !== 200 || res.type === 'opaque') return res;
      caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match('/Notiva-Notes/index.html'));
  })
));
