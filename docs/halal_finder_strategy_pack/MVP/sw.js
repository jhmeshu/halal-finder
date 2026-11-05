// HF-09: Live interactive Leaflet map integration + network-first data updates.
// Bump the cache version whenever the shell changes so old caches are dropped.
const CACHE = 'halal-finder-shell-v7';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/tokens.css',
  './assets/css/app.css',
  './assets/vendor/leaflet/leaflet.css',
  './assets/vendor/leaflet/leaflet.js',
  './icon-192.png',
  './icon-512.png',
  './src/app.js',
  './src/barcode.js',
  './src/business.js',
  './src/cards.js',
  './src/config.js',
  './src/detail.js',
  './src/discover.js',
  './src/dom.js',
  './src/evidence.js',
  './src/install.js',
  './src/listings.js',
  './src/map.js',
  './src/privacy.js',
  './src/report.js',
  './src/router.js',
  './src/saved.js',
  './src/screening.js',
  './data/listings.json',
  './data/sample-listings.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first strategy for dynamic data routes to guarantee live updates
  if (url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ||
      fetch(event.request).then(response => {
        if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
        return response;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
