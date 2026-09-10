/* Service Worker for SOLMAR Portal Interno
   Handles Web Push notifications & offline asset caching
*/

const CACHE_NAME = 'solmar-portal-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://i.postimg.cc/cCPc7DGG/IMG-3504-JPG.jpg'
];

// Install event: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Cache addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notification received event
self.addEventListener('push', (event) => {
  let data = {
    title: 'SOLMAR - Portal Interno',
    body: 'Hay novedades en el portal.',
    icon: 'https://i.postimg.cc/cCPc7DGG/IMG-3504-JPG.jpg',
    badge: 'https://i.postimg.cc/cCPc7DGG/IMG-3504-JPG.jpg',
    tag: 'solmar-notification',
    url: '/'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || 'https://i.postimg.cc/cCPc7DGG/IMG-3504-JPG.jpg',
    badge: data.badge || 'https://i.postimg.cc/cCPc7DGG/IMG-3504-JPG.jpg',
    tag: data.tag || 'solmar-notification-' + Date.now(),
    data: {
      url: data.url || '/'
    },
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event: opens or focuses the tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
