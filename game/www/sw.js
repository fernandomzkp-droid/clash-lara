const CACHE='lara-rune-clash-v8-native-beta';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./engine-core.js','./gameplay-rules.js','./rpg-system.js','./rpg-ui.js','./ui-shell.js','./design-system.css','./game.js','./world-art.js','./world-domain.js','./world-ui.js','./world-start.js','./world-online.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lara-rune-clash-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(net=>{if(net.ok){const clone=net.clone();caches.open(CACHE).then(c=>c.put(e.request,clone))}return net})))})
