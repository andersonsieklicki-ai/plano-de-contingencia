const CACHE_NAME = 'defesa-civil-v2'; // Mudamos para v2 para forçar a atualização
const urlsToCache = [
  'index.html',
  'manifest.json',
  'defesa.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  self.skipWaiting(); // Força o novo arquivo a assumir imediatamente, sem esperar o motorista fechar o app
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Ativação e Limpeza de Caches Antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se encontrar um cache antigo (v1), ele apaga e deixa só o v2
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Garante que a tela atual já comece a usar a versão nova
  );
});

// Estratégia "Network First" (Tenta a internet primeiro, se falhar, usa o cache offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se conseguiu baixar da internet, já atualiza o cache para ter a versão mais recente salva
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Se estiver sem internet (offline), pega o que está salvo no cache
        return caches.match(event.request);
      })
  );
});
