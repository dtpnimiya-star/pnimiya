// Fast start: the app opens at once from the saved copy and refreshes it in the background.
// An update link (?v=...) and the version check always go to the network, so new versions still arrive.
// The Firebase and Excel libraries have fixed version numbers, so they are kept and reused.
const CACHE='pnimiya-v3';
const LIBS=/^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdnjs\.cloudflare\.com\/ajax\/libs\/xlsx\/)/;
const SHELL=new URL('./',self.registration.scope).href;
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const save=(key,res)=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(x=>x.put(key,c)).catch(()=>{})}return res};
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(LIBS.test(r.url)){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>save(r,res))));return}
  if(u.origin!==location.origin)return; // Firebase data goes straight to the network
  if(/\.apk$/.test(u.pathname))return;
  const doc=r.mode==='navigate'||u.href.split(/[?#]/)[0]===SHELL||u.pathname.endsWith('/index.html');
  if(doc){
    const net=()=>fetch(u.href,{cache:'no-store',credentials:'same-origin'}).then(res=>{if(res.ok)save(SHELL,res);return res});
    if(r.mode==='navigate'&&!u.searchParams.has('v')){
      e.respondWith(caches.match(SHELL).then(m=>{const n=net();if(m){e.waitUntil(n.catch(()=>{}));return m}return n.catch(()=>Response.error())}));
    }else e.respondWith(net().catch(()=>caches.match(SHELL).then(m=>m||Response.error())));
    return}
  e.respondWith(fetch(r).then(res=>save(u.origin+u.pathname,res)).catch(()=>caches.match(u.origin+u.pathname).then(m=>m||Response.error())));
});
self.addEventListener('notificationclick',e=>{e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs.find(x=>x.url.includes('/pnimiya/'));return c?c.focus():self.clients.openWindow('./')}))});
