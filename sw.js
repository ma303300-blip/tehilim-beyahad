const CACHE_NAME = 'tehilim-beyahad-v76';
const ASSETS = [
  '/tehilim-beyahad/',
  '/tehilim-beyahad/manifest.json',
  '/tehilim-beyahad/icon-192.png',
  '/tehilim-beyahad/icon-512.png',
  '/tehilim-beyahad/apple-touch-icon.png',
  '/tehilim-beyahad/psalms_hebrew.json',
  '/tehilim-beyahad/bookcase-closed.png',
  '/tehilim-beyahad/bookcase-open.png'
];

// skipWaiting מיידי — לא מחכה ל-cache.addAll
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// הפעלה מיידית + מחיקת קאש ישן
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// הודעה מהדף — skipWaiting דרך postMessage
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHTML) {
    // index.html — network first, קאש כגיבוי
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // שאר הקבצים — cache first
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request).then(res => {
        if (res && res.status === 200) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }))
      .catch(() => caches.match('/tehilim-beyahad/index.html'))
  );
});
