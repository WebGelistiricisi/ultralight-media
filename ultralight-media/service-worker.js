const CACHE_NAME = "ultralight-media-v3";
const APP_SHELL = [
  "./", "./index.html", "./manifest.json", "./styles/main.css",
  "./src/app.js", "./src/core/emitter.js", "./src/core/player.js",
  "./src/audio/engine.js", "./src/audio/visualizer.js",
  "./src/library/library.js", "./src/storage/settings.js", "./src/ui/ui.js",
  "./assets/icon.svg", "./assets/icon-192.png", "./assets/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("ultralight-media-") && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put("./index.html", copy)); }
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
