
const CACHE_NAME = "running-app-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalacja Service Workera
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Aktywacja Service Workera
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) {
            return name !== CACHE_NAME;
          })
          .map(function(name) {
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

// Obsługa żądań plików - strategia network-first
self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.url.startsWith(self.registration.scope)) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          if (response.ok) {
            const responseCopy = response.clone();

            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseCopy);
            });
          }

          return response;
        })
        .catch(function() {
          return caches.match(event.request);
        })
    );
  }
});
