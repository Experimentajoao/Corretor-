// Guarda o app no celular para funcionar sem internet.
// Ao publicar uma versão nova do app, troque o número abaixo.
const VERSAO = 'corretor-v5';
const ARQUIVOS = ['./', './index.html', './manifest.json', './icone-192.png', './icone-512.png', './icone-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // tenta a internet primeiro (pega versões novas); sem internet, usa a cópia guardada
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) {
        const copia = r.clone(); caches.open(VERSAO).then(c => c.put(e.request, copia));
      }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
