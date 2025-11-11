const CACHE_NAME = 'photo-report-app-v2';
const urlsToCache = [
  '/ReportFotografico/',
  '/ReportFotografico/index.html',
  '/ReportFotografico/app.js',
  '/ReportFotografico/styles.css',
  '/ReportFotografico/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - pulisce vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event - cache first
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;
        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return networkResponse;
      }).catch(() => caches.match('/ReportFotografico/index.html'));
    })
  );
});

// Messaggi dal client
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Avvisa i client che c’è una nuova versione
self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientsArr => {
      clientsArr.forEach(client => client.postMessage({ type: 'NEW_VERSION_AVAILABLE' }));
    })
  );
});
