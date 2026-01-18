const API_KEY = "bf7f0baaa9b0a00164c28205f407843a0fbcb9d9"

const statusEl = document.getElementById("status")
const coordsEl = document.getElementById("coords")
const resultEl = document.getElementById("result")
const hintEl = document.getElementById("hint")
const btn = document.getElementById("btn")
const autoBtn = document.getElementById("auto")

let autoOn = false
let timer = null

function setStatus(t){ statusEl.textContent = t }

async function getElevation(lat, lon){
const url =
"https://tessadem.com/api/elevation?key=
" +
encodeURIComponent(API_KEY) +
"&locations=" +
encodeURIComponent(lat + "," + lon) +
"&unit=meters"
const r = await fetch(url)
if(!r.ok){
const txt = await r.text().catch(function(){ return "" })
throw new Error("API fout " + r.status + " " + txt)
}
const data = await r.json()
const elev = data && data.results && data.results[0] ? data.results[0].elevation : null
if(typeof elev !== "number") throw new Error("Geen hoogte")
return elev
}

function getGps(){
return new Promise(function(resolve, reject){
if(!navigator.geolocation){
reject(new Error("Geen GPS in deze browser"))
return
}
navigator.geolocation.getCurrentPosition(resolve, reject, {
enableHighAccuracy:true,
timeout:15000,
maximumAge:0
})
})
}

async function measure(){
try{
setStatus("GPS ophalen")
hintEl.textContent = ""
resultEl.textContent = ""
coordsEl.textContent = ""

const pos = await getGps()
const lat = pos.coords.latitude
const lon = pos.coords.longitude
const acc = Math.round(pos.coords.accuracy)

coordsEl.textContent = "lat " + lat + " lon " + lon + " acc " + acc + " m"

setStatus("Hoogte ophalen")
const h = await getElevation(lat, lon)

setStatus("klaar")
resultEl.textContent = "Hoogte " + h.toFixed(1) + " m"
hintEl.textContent = "Tip, installeer deze pagina als app via je browser menu"
}catch(e){
setStatus("fout")
resultEl.textContent = String(e.message || e)
}
}

btn.addEventListener("click", function(){
measure()
})

autoBtn.addEventListener("click", function(){
autoOn = !autoOn
autoBtn.textContent = autoOn ? "Auto aan" : "Auto uit"
if(timer) clearInterval(timer)
timer = null
if(autoOn){
measure()
timer = setInterval(measure, 5000)
}
})

if("serviceWorker" in navigator){
navigator.serviceWorker.register("./sw.js").catch(function(){})
}
