const CACHE_NAME = "ssems-v2-safe";
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

// Install Event: Cache critical static assets only
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Force this new SW to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching static assets...");
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event: Clean up old caches (Fixes "White Screen" from bad cache)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});

// Fetch Event: Safe Network-First Strategy for Documents, Cache-First for Known Static Assets
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests (e.g., Firebase, Google Fonts)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // 1. Navigation Requests (HTML Pages) -> Network First -> Offline Fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, show offline page
          return caches.match("/offline")
            .then((response) => {
              if (response) return response;
              return new Response("You are offline. Please check your connection.", { 
                status: 200, 
                headers: { "Content-Type": "text/plain" } 
              });
            });
        })
    );
    return;
  }

  // 2. Static Assets -> Cache First (Only if in cache), then Network
  // We do NOT cache dynamic API responses here to prevent data staleness.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // We could cache new assets here, but for stability now, we won't.
        // This ensures if we deploy a new JS file, the user gets it.
        return networkResponse;
      }).catch(() => {
        // If network fails for an asset (e.g. image), return nothing (404-like)
        // or a placeholder if we had one.
        return new Response(null, { status: 404 });
      });
    })
  );
});
