/* Guarda la página de registro en el teléfono del invitado para que su pase
   abra aunque no haya señal en el salón. Primero intenta internet y, si no
   hay, usa la copia guardada. No toca Firebase ni las páginas del staff. */
var CACHE = 'rf27-v1';
var ARCHIVOS = [
  './',
  './index.html',
  './config.js',
  './comun.js',
  './assets/guilloche.svg',
  './assets/logo-rv.png',
  './assets/logo-taxpro.png',
  './assets/favicon.png',
  'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var propio = url.origin === self.location.origin && !/(recepcion|admin)\.html$/.test(url.pathname);
  var fuentes = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  var libreria = url.href.indexOf('cdn.jsdelivr.net/npm/qrcode-generator') >= 0;
  if (!propio && !fuentes && !libreria) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && (r.ok || r.type === 'opaque')) {
        var copia = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) {
        return r || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined);
      });
    })
  );
});
