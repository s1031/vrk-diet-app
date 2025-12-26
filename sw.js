const CACHE_NAME = "vrk-cache-v1";
const urlsToCache = [
  "./",
  "./index.html"
];

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// push notification handler for background notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "VRK Diet Reminder",
      icon: data.icon || "🥗",
      badge: data.badge || "🥗",
      tag: data.tag || "vrk-reminder",
      requireInteraction: true,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      silent: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "VRK Diet Reminder", options)
    );
  }
});

// notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // Open app if not already open
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});

// notification close handler
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification.tag);
});
