/* Unplugged service worker: caches the app so it works fully offline.
   Bump CACHE when you ship a new version so old files get cleaned up. */
var CACHE = "unplugged-v8";
var CORE = ["./", "index.html", "manifest.json", "favicon.svg", "icon.svg", "icon-maskable.svg", "apple-touch-icon.png"];
var FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* add one by one so a missing optional file (like favicon.png) can't break install */
      return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Serve from cache instantly, refresh the cache in the background. */
function staleWhileRevalidate(req, fallbackUrl) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
        return res;
      }).catch(function () { return null; });
      if (hit) return hit;
      return net.then(function (res) {
        if (res) return res;
        return fallbackUrl ? cache.match(fallbackUrl) : Response.error();
      });
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(staleWhileRevalidate(req, req.mode === "navigate" ? "index.html" : null));
  } else if (FONT_HOSTS.indexOf(url.hostname) >= 0) {
    e.respondWith(staleWhileRevalidate(req, null));
  }
});
