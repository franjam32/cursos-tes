const CACHE = 'cursos-tes-v1';
const ASSETS = [
  '/cursos-tes/cursos_instructor.html',
  '/cursos-tes/manifest.json',
];

// Instalar y cachear assets principales
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Fetch: network first, cache fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Recibir mensaje para programar notificación
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    const { title, body, delay, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: '/cursos-tes/icon-192.png',
        badge: '/cursos-tes/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data: { url: '/cursos-tes/cursos_instructor.html' }
      });
    }, delay || 0);
  }
});

// Click en notificación → abrir la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/cursos-tes/cursos_instructor.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('cursos_instructor'));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
