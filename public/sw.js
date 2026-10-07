/* ===========================================================================
   ذِكري — Service Worker (بسيط ومحفوظ)
   الاستراتيجية: الشبكة أولًا ثم الذاكرة المؤقتة (network-first)
   حتى يحصل المستخدم دائمًا على أحدث نسخة عند توفر الإنترنت،
   ويقفز إلى النسخة المحفوظة عند انقطاعه.
   ========================================================================= */

const CACHE_NAME = "dhikri-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(["./", "./index.html", "./manifest.webmanifest"].filter(Boolean)),
      )
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // لا نعترض طلبات خارج نطاق الموقع (خطوط Google، إلخ) إن وُجدت
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => undefined);
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || caches.match("./index.html")),
      ),
  );
});
