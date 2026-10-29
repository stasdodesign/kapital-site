const CACHE_NAME = 'kapital-v1';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Всё, что НЕ GET (API, POST) — сквозь сеть БЕЗ кэша: AI-ассистент кэшировать запрещено
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Не кэшировать API запросы
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Только HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Только запросы того же домена
  if (url.origin !== self.location.origin) {
    return;
  }

  // Навигационные запросы (HTML) — сеть первой, при офлайне — из кэша "/"
  const isNavigation = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/', responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }

  // GET-запросы того же домена (стили, скрипты, шрифты, иконки) — кэш первым, обновление в фоне
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Игнорируем сетевые сбои фонового обновления
        });

      return cachedResponse || fetchPromise;
    })
  );
});
