// This is a basic service worker for PWA functionality
// It will be enhanced by Workbox during production build

/* eslint-disable no-restricted-globals */

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here if you have the
// messagingSenderId.
const CACHE_NAME = 'gestao-frotas-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.e6c13ad2.css',
  '/static/js/main.f146502b.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

