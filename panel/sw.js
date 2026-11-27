// Kontrol paneli: ana ekrandan açılınca sayfa iskeleti (sayfa, logo, simge, arka plan) telefondan gelir.
// Veri her açılışta sunucudan alınır, saklanmaz.
const KUTU = 'mentiy-panel-v1';
const ISKELET = ['./', 'index.html', 'logo.svg', 'zemin.mp4', 'simge-192.png', 'apple-touch-icon.png', 'manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(KUTU).then((k) => k.addAll(ISKELET)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((adlar) => Promise.all(adlar.filter((a) => a !== KUTU).map((a) => caches.delete(a)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Yalnız kendi dosyalarımız; sunucu verisi ve dış adresler hiç saklanmaz.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Önce ağ (yeni sürüm hemen gelsin), ağ yoksa saklı kopya.
  e.respondWith(
    fetch(e.request)
      .then((yanit) => {
        if (yanit.ok && yanit.status === 200) {
          const kopya = yanit.clone();
          caches.open(KUTU).then((k) => k.put(e.request, kopya));
        }
        return yanit;
      })
      .catch(() => caches.match(e.request)),
  );
});
