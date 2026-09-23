/* Tide service worker — offline app, plus nudges that read your day before they speak.
   Bump VERSION whenever you change files. */
const VERSION = 'tide-v8.4.0';
importScripts('js/astro.js', 'js/blueprint.js', 'js/sky.js', 'js/affirmations.js');

const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/config.js', 'js/data.js', 'js/treasures.js', 'js/astro.js', 'js/blueprint.js', 'js/sky.js', 'js/affirmations.js',
  'js/store.js', 'js/ui.js', 'js/push.js', 'js/game.js', 'js/app.js',
  'js/pages/pool.js', 'js/pages/surf.js', 'js/pages/sit.js', 'js/pages/make.js', 'js/pages/treasures.js',
  'js/calendar.js', 'js/pages/sabbat.js', 'js/pages/venus.js',
  'js/pages/affirm.js', 'js/pages/stars.js', 'js/pages/ritual.js', 'js/pages/gut.js', 'js/pages/more.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(SHELL.map(async (path) => {
      const res = await fetch(path, { cache: 'reload' });
      if (res.ok) await cache.put(path, res);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tide-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('tidefonts').then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      c.put(req, res.clone());
      return res;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    const fresh = await Promise.race([
      net,
      new Promise((resolve) => setTimeout(() => resolve(null), 2500))
    ]);
    if (fresh && fresh.ok) return fresh;
    if (hit) return hit;
    return (await net) || fresh || fetch(req);
  })());
});

/* ---------- Nudges ---------- */
function readState() {
  return new Promise((resolve) => {
    try {
      const r = indexedDB.open('tide', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => {
        try {
          const get = r.result.transaction('kv').objectStore('kv').get('state');
          get.onsuccess = () => resolve(get.result || null);
          get.onerror = () => resolve(null);
        } catch (e) { resolve(null); }
      };
      r.onerror = () => resolve(null);
    } catch (e) { resolve(null); }
  });
}

self.addEventListener('push', (e) => {
  let slot = 'morning';
  try { slot = (e.data && e.data.json().slot) || slot; } catch (err) {}
  e.waitUntil(readState().then((state) => {
    const w = TideSky.whisper(slot, state, new Date());
    return self.registration.showNotification(w.title, {
      body: w.body,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: w.tag || 'tide-' + slot,
      data: { url: w.url }
    });
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope)) { return c.navigate(target).then((cc) => (cc || c).focus()); }
    }
    return self.clients.openWindow(target);
  }));
});
