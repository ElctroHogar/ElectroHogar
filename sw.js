// Service Worker — Electro Hogar PRO
const CACHE = 'electrohogar-v1';
const FILES = [
  './',
  './secondshop_pro.html',
  './secondshop_pro_tablet.html',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Install: cache all files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      console.log('Caching app files...');
      return cache.addAll(FILES).catch(err => console.log('Cache error:', err));
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', e => {
  // Skip Firebase requests - always from network
  if(e.request.url.includes('firebase') || e.request.url.includes('googleapis')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      });
    }).catch(() => caches.match('./secondshop_pro.html'))
  );
});

// Background sync for Firebase when back online
self.addEventListener('sync', e => {
  if(e.tag === 'firebase-sync') {
    console.log('Background sync triggered');
  }
});
