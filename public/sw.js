/* ===========================================================================
   ذِكري — Service Worker (بسيط ومحفوظ)
   الاستراتيجية:
   • التنقّل (documents): الشبكة أولًا ثم الذاكرة — أحدث نسخة عند توفر
     الإنترنت، ونسخة الموقع المحفوظة عند انقطاعه أو تعطّل الخادم.
   • ملفات /assets/: الذاكرة أولًا لأن أسماءها تتغيّر مع كل بناء (مُهيّأة
     للمحتوى الثابت)، فلا معنى لإعادة جلبها في كل زيارة.
   • بقية الطلبات: الشبكة أولًا ثم الذاكرة.
   ملاحظة مهمة: انقطاع الخادم قد يظهر كـ «خطأ شبكة» (fetch يرفض) أو كاستجابة
   خادم غير صالحة (502/503 من وسيط أو مزوّد استضافة). نتعامل مع الحالتين معًا،
   لأن المقصود واحد: الخادم غير متاح الآن.
   ========================================================================= */

const CACHE_NAME = "dhikri-v2";

/** الأصول التي يجب أن تكون جاهزة قبل تفعيل النسخة الجديدة */
const PRECACHE = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

/** هل نُعامل الاستجابة كتعذّر الوصول؟ (خطأ شبكة أو خادم معطّل) */
function isUnreachable(res) {
  return !res || !res.ok;
}

/** يحاول إرجاع نسخة محفوظة، وإلا استجابة خطأ صريحة بدل صفحة بيضاء */
async function fromCache(req, fallbackDoc) {
  const hit =
    (await caches.match(req)) ||
    (await caches.match(req, { ignoreSearch: true })) ||
    (fallbackDoc ? await caches.match(fallbackDoc) : undefined);
  if (hit) return hit;
  return new Response("تعذّر الاتصال بالخادم، والمحتوى غير محفوظ على الجهاز.", {
    status: 503,
    statusText: "Offline",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // لا نعترض طلبات خارج نطاق الموقع (إن وُجدت خارجية)
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === "navigate" || req.destination === "document";
  const isImmutableAsset = url.pathname.includes("/assets/");

  // الأصول المُهيّأة: الذاكرة أولًا ثم الشبكة
  if (isImmutableAsset) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => undefined);
            }
            return res;
          }),
      ),
    );
    return;
  }

  // الباقي: الشبكة أولًا، ثم المخزن عند أي تعذّر
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (!isUnreachable(res)) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => undefined);
          return res;
        }
        // استجابة غير صالحة (مثل 502 من وسيط) — نُسقط إلى المخزن
        return fromCache(req, isNavigation ? "./index.html" : undefined);
      })
      .catch(() => fromCache(req, isNavigation ? "./index.html" : undefined)),
  );
});
