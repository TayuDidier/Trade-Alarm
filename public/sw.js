// Minimal service worker for TradeAlarm PWA installability
const _CACHE_NAME = 'tradealarm-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle requests
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
