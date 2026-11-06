const CACHE_NAME = "bombarda-1793990330";
const PRECACHE_URLS = [
  "/",
  "/CNAME",
  "/LICENSE",
  "/assets/css/site.css",
  "/assets/fonts/VT323-OFL.txt",
  "/assets/fonts/vt323.woff2",
  "/assets/icons/apple-touch-icon.png",
  "/assets/icons/favicon-32.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/js/app.min.js",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch((error) => {
            if (request.mode === "navigate") {
              return caches.match("/");
            }
            throw error;
          }),
    ),
  );
});
