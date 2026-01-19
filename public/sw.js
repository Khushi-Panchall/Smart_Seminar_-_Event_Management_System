const CACHE_NAME = "ssems-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.png",
  "/logo-icon.png",
  "/logo-full.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/offline"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests (HTML)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match("/offline")
            .then((response) => {
                if (response) return response;
                // Fallback to root if offline page is missing from cache (shouldn't happen)
                return caches.match("/") || new Response("You are offline.", { status: 503, headers: { "Content-Type": "text/plain" } });
            });
        })
    );
    return;
  }

  // Handle static assets (Cache First)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
              // Cache successful responses for future use
              // Don't cache API calls or POST requests here if not intended
              if (event.request.method === "GET") {
                  cache.put(event.request, fetchResponse.clone());
              }
              return fetchResponse;
          });
      });
    })
  );
});
