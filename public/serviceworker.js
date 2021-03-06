const FILES_TO_CACHE = [
  "/",
  "/db.js",
  "/index.html",
  "/styles.css",
  "/manifest.webmanifest",
  "/index.js"
//   "/icons/icon-192x192.png",
//   "/icons/icon-512x512.png"
];

const CACHE_FILE = "static-cache-original";
const FILE_CACHE_DATA = "data-cache-new";
// set up install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches
      .open(CACHE_FILE)
      .then((cache) => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch(function (err) {
        console.log("not running", err);
      })
  );
  self.skipWaiting();
});
// activate
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_FILE && key !== FILE_CACHE_DATA) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});


// fetch data 
self.addEventListener("fetch", (event) => {
  // non GET requests are not cached and requests to other origins are not cached
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request));
    return;
  }
  // handle runtime GET requests for data from /api routes
  if (event.request.url.includes("/api/")) {
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches.open(FILE_CACHE_DATA).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }
  // use cache first for all other requests for performance
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // request is not in cache. make network request and cache the response
      return caches.open(FILE_CACHE_DATA).then((cache) => {
        return fetch(event.request).then((response) => {
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});


