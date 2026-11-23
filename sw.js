const VERSION = "08a4d1a2d6b5";
const ARCHIVOS = ["./assets/KaTeX_AMS-Regular-BQhdFMY1.woff2","./assets/KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2","./assets/KaTeX_Caligraphic-Regular-Di6jR-x-.woff2","./assets/KaTeX_Fraktur-Bold-CL6g_b3V.woff2","./assets/KaTeX_Fraktur-Regular-CTYiF6lA.woff2","./assets/KaTeX_Main-Bold-Cx986IdX.woff2","./assets/KaTeX_Main-BoldItalic-DxDJ3AOS.woff2","./assets/KaTeX_Main-Italic-NWA7e6Wa.woff2","./assets/KaTeX_Main-Regular-B22Nviop.woff2","./assets/KaTeX_Math-BoldItalic-CZnvNsCZ.woff2","./assets/KaTeX_Math-Italic-t53AETM-.woff2","./assets/KaTeX_SansSerif-Bold-D1sUS0GD.woff2","./assets/KaTeX_SansSerif-Italic-C3H0VqGB.woff2","./assets/KaTeX_SansSerif-Regular-DDBCnlJ7.woff2","./assets/KaTeX_Script-Regular-D3wIWfF6.woff2","./assets/KaTeX_Size1-Regular-mCD8mA8B.woff2","./assets/KaTeX_Size2-Regular-Dy4dx90m.woff2","./assets/KaTeX_Size4-Regular-Dl5lxZxV.woff2","./assets/KaTeX_Typewriter-Regular-CO6r4hn1.woff2","./assets/movil-CGJ6HpWJ.js","./assets/movil-DTWEFrjr.css","./icono-192.png","./icono-512-mascara.png","./icono-512.png","./icono.svg","./manifest.webmanifest"];

// Service worker de la app de móvil, escrito a mano. Al compilar, vite.movil.config.ts antepone
// VERSION y ARCHIVOS (todo lo que hay en dist/movil).
//
// - Al instalarse, guarda en caché todos los ficheros de la app: así abre en modo avión.
// - Sirve la app desde la caché; los datos no pasan por aquí (van a IndexedDB y a api.github.com).
// - Una versión nueva se instala en segundo plano y se usa la siguiente vez que se abre la app,
//   para no recargar a mitad de un test.

/* global VERSION, ARCHIVOS */
const CACHE = `opo-movil-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(['./', ...ARCHIVOS]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k.startsWith('opo-movil-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Cualquier navegación abre la app (index.html); el resto, de la caché y, si falta, de la red.
  const clave = req.mode === 'navigate' ? './' : req;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const guardada = await c.match(clave, { ignoreSearch: req.mode === 'navigate' });
      if (guardada) return guardada;
      const r = await fetch(req);
      if (r.ok && req.mode !== 'navigate') c.put(req, r.clone());
      return r;
    }),
  );
});
