/* Offline support for My Games.
   Every game file is saved on the device the first time it is opened online.
   After that the game opens straight from the device (no Wi-Fi needed), and when online
   it quietly checks for a newer copy, so updates show up the next time the game is opened. */
var CACHE = "my-games-1";
var FILES = ["./", "icon-my-games-180.png", "icon-my-games-192.png", "icon-my-games-512.png", "icon-rainbow-ribbons-180.png", "icon-rainbow-ribbons-192.png", "icon-rainbow-ribbons-512.png", "icon-ribbon-hunt-180.png", "icon-ribbon-hunt-192.png", "icon-ribbon-hunt-512.png", "index.html", "my-games.webmanifest", "rainbow-ribbons.html", "rainbow-ribbons.webmanifest", "ribbon-hunt.html", "ribbon-hunt.webmanifest"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var fresh = fetch(req, { cache: "no-cache" }).then(function (res) {
        if (res && res.ok) c.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      if (hit) { e.waitUntil(fresh.then(function () {}, function () {})); return hit; }
      return fresh;
    });
  }));
});
