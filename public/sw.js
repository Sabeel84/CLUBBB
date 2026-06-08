// CLUBBB Service Worker — enables PWA install + offline shell
const CACHE = "clubbb-v3";  // ← bumped to bust old cached blank page
const SHELL  = ["/", "/index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  // Delete ALL old caches (clubbb-v1, clubbb-v2, etc.)
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Always network for Supabase API calls
  if (e.request.url.includes("/rest/v1/") || e.request.url.includes("supabase")) {
    return;
  }
  // Network first — fall back to cache only if offline
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(r => r || caches.match("/")))
  );
});

// Push notifications
self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "CLUBBB", {
      body:  data.body  || "You have a new notification",
      icon:  "/icon-192.png",
      badge: "/icon-192.png",
      tag:   data.tag   || "clubbb",
      data:  { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || "/"));
});
