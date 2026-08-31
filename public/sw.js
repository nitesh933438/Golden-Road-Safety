const CACHE_NAME = 'goldenguard-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon.ico',
  './favicon.svg',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Bypass caching for Vite development assets to prevent interference with HMR and dynamic imports
  if (
    event.request.url.includes('/@vite/') || 
    event.request.url.includes('/@id/') || 
    event.request.url.includes('/src/') ||
    event.request.url.includes('/node_modules/') ||
    event.request.url.includes('chrome-extension:') ||
    event.request.url.includes('hot-update')
  ) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // If we have a cached version, return it, but also try to update it
          fetch(event.request).then(res => {
            if (res && res.status === 200 && res.type === 'basic') {
              const resToCache = res.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, resToCache);
              });
            }
          }).catch(() => {});
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push Notification Handler
self.addEventListener('push', event => {
  let data = { title: 'GoldenGuard Emergency Alert', body: 'Golden Hour dispatch update received.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icon-192.png',
    badge: './favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/notifications'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/notifications')
  );
});
