const CACHE_PREFIX = "gymmaster-pwa-"
const STATIC_CACHE = `${CACHE_PREFIX}static-v1`
const OFFLINE_URL = "/offline.html"

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/gymmaster-192.png",
  "/icons/gymmaster-512.png",
  "/icons/gymmaster-maskable-512.png",
]

const EXACT_STATIC_PATHS = new Set([
  ...PRECACHE_URLS,
  "/assets/gymmaster/gymmaster-mark.svg",
  "/assets/gymmaster/gymmaster-wordmark.svg",
])

function isApiPath(pathname) {
  return pathname === "/api" || pathname.startsWith("/api/")
}

function isRscOrRouterPrefetch(request, url) {
  return (
    url.searchParams.has("_rsc") ||
    request.headers.get("rsc") === "1" ||
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch"
  )
}

function isAllowlistedStaticRequest(request, url) {
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return false
  }

  if (isApiPath(url.pathname) || isRscOrRouterPrefetch(request, url)) {
    return false
  }

  return url.pathname.startsWith("/_next/static/") || EXACT_STATIC_PATHS.has(url.pathname)
}

async function cacheAllowlistedStatic(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)
  if (response.ok && response.type !== "opaque") {
    await cache.put(request, response.clone())
  }

  return response
}

async function navigateWithOfflineFallback(request) {
  try {
    return await fetch(request, { cache: "no-store" })
  } catch {
    const cache = await caches.open(STATIC_CACHE)
    return (await cache.match(OFFLINE_URL)) ?? Response.error()
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== STATIC_CACHE)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting()
  }
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET" || url.origin !== self.location.origin || isApiPath(url.pathname)) {
    return
  }

  if (isRscOrRouterPrefetch(request, url)) {
    return
  }

  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(navigateWithOfflineFallback(request))
    return
  }

  if (isAllowlistedStaticRequest(request, url)) {
    event.respondWith(cacheAllowlistedStatic(request))
  }
})
