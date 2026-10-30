// Service worker: mantém o app instalável e abre mesmo com internet fraca.
// Busca sempre a versão mais nova primeiro; só usa a cópia guardada se estiver sem internet.
const CACHE = 'portal-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('portal-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return; // não interfere nas chamadas ao Google
  e.respondWith(
    fetch(req)
      .then(res => { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res; })
      .catch(() => caches.match(req).then(m => m || caches.match('index.html')))
  );
});
