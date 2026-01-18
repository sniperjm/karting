const CACHE = "gps-hoogte-v1"
const ASSETS = [
"./",
"./index.html",
"./app.js",
"./manifest.webmanifest"
]

self.addEventListener("install", function(e){
e.waitUntil(
caches.open(CACHE).then(function(cache){
return cache.addAll(ASSETS)
})
)
})

self.addEventListener("activate", function(e){
e.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", function(e){
e.respondWith(
caches.match(e.request).then(function(resp){
return resp || fetch(e.request)
})
)
})
