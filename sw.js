// Service worker do app de treino
const VERSION = "661d9dff24";
const SHELL = "shell-" + VERSION;
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./fonts/barlow-condensed-500.woff2","./fonts/barlow-condensed-600.woff2","./fonts/barlow-condensed-700.woff2","./fonts/jetbrains-mono-500.woff2","./fonts/source-sans-3-400.woff2","./fonts/source-sans-3-600.woff2","./fonts/source-sans-3-700.woff2"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // YouTube e outros seguem direto para a internet

  // Página: tenta a rede (pega a versão nova do treino) e usa a cópia salva sem internet
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(SHELL).then((c) => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Arquivos do próprio app (ícones, fontes, manifest): cópia salva primeiro
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
