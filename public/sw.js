// Service Worker mínimo para cumplir con los requisitos de PWA (instalación)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Solo passthrough, pero es necesario para que sea instalable
  event.respondWith(fetch(event.request));
});
