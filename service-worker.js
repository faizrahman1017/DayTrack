const CACHE_NAME = 'daytrack-v7';
const APP_SHELL = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.pathname.endsWith('/index.html') || url.pathname.endsWith('/DayTrack/')){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(event.request,c));}return r;}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached || fetch(event.request).then(r=>{if(r&&r.ok&&url.origin===self.location.origin){const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(event.request,c));}return r;})));
});
