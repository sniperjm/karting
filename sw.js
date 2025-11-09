
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('sproeier-cache-v4').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.webmanifest',
        './icon-512.png',
        './logo.png'
      ]);
    })
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
