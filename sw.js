const SHELL='ts-shell-v2';
const FILES=['./','./index.html','./model.js','./layers.js','./ui.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/suncalc@1.9.0/suncalc.js','https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'];
const TILE_HOSTS=['basemap.nationalmap.gov','server.arcgisonline.com','s3.amazonaws.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('ts-shell')&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
  // App code: network first so updates arrive, cache when offline
  if(req.mode==='navigate'||u.origin===location.origin||u.hostname==='unpkg.com'){
    e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(SHELL).then(c=>c.put(req.mode==='navigate'?'./':req,cp))}return r})
      .catch(()=>caches.match(req.mode==='navigate'?'./':req).then(r=>r||caches.match('./index.html'))));return}
  // Map and elevation tiles: cache first
  if(TILE_HOSTS.includes(u.hostname)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{
      if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open('ts-tiles').then(c=>c.put(req,cp))}return r})))}
});
