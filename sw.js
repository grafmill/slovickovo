// Slovíčkovo offline: appka sa uloží do telefónu, lekcie.json sa vždy skúša najprv z internetu
const CACHE = 'slovickovo-202610221730';
const CORE = ["./", "index.html", "manifest.webmanifest", "fonts/fonts.css", "fonts/Andika-400-latin-ext.woff2", "fonts/Andika-400-latin.woff2", "fonts/Andika-700-latin-ext.woff2", "fonts/Andika-700-latin.woff2", "fonts/Baloo2-600-latin-ext.woff2", "fonts/Baloo2-600-latin.woff2", "fonts/Baloo2-800-latin-ext.woff2", "fonts/Baloo2-800-latin.woff2", "ikony/ikona-180.png", "ikony/ikona-192.png", "ikony/ikona-512.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('lekcie.json')) return; // vždy z internetu, appka si posledný stav pamätá sama
  const fresh = e.request.mode === 'navigate' || url.pathname.endsWith('index.html');
  if (fresh) { // nová verzia appky sa načíta hneď, bez internetu ide uložená
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('index.html', c)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })));
});
