/**
 * sw.js — Service Worker
 * Enables offline use by caching app shell assets.
 */

const CACHE_NAME = 'notiva-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/theme.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/editor.css',
  './assets/css/mobile.css',
  './assets/js/vault.js',
  './assets/js/ui.js',
  './assets/js/editor.js',
  './assets/js/graph.js',
  './assets/js/app.js',
  // Google Fonts are cached on first use by the browser
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses for app shell
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: return index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
