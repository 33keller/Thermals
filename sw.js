const SHELL='ts-shell-v1';
const FILES=['./','./index.html','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/suncalc@1.9.0/suncalc.js'];
const TILE_HOSTS=['basemap.nationalmap.gov','server.arcgisonline.com','s3.amazonaws.com','unpkg.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(SHELL).then(c=>c.put('./',cp));return r})
      .catch(()=>caches.match('./').then(r=>r||caches.match('./index.html'))));return}
  if(TILE_HOSTS.includes(u.hostname)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{
      if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open('ts-tiles').then(c=>c.put(req,cp))}return r})))}
});
