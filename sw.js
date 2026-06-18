const CACHE_NAME = 'tehilim-beyahad-v14';
const ASSETS = [
  '/tehilim-beyahad/',
  '/tehilim-beyahad/index.html',
  '/tehilim-beyahad/manifest.json',
  '/tehilim-beyahad/icon-192.png',
  '/tehilim-beyahad/icon-512.png',
  '/tehilim-beyahad/apple-touch-icon.png',
  '/tehilim-beyahad/psalms_hebrew.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }))
      .catch(() => caches.match('/tehilim-beyahad/index.html'))
  );
});
