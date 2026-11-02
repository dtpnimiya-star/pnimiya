// Network-first: always the latest version when online; last saved copy when offline.
// Also keeps a copy of the Firebase and Excel libraries so the app can open with no connection.
const CACHE='pnimiya-v2';
const LIBS=/^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdnjs\.cloudflare\.com\/ajax\/libs\/xlsx\/)/;
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const lib=LIBS.test(r.url);
  if(u.origin!==location.origin&&!lib)return; // Firebase data goes straight to the network
  e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:!lib}).then(m=>m||(lib?Response.error():caches.match('./')))));
});
self.addEventListener('notificationclick',e=>{e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs.find(x=>x.url.includes('/pnimiya/'));return c?c.focus():self.clients.openWindow('./')}))});
