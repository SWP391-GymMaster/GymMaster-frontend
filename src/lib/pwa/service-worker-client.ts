import {
  LEGACY_OFFLINE_QUEUE_KEY,
  PWA_CACHE_PREFIX,
  PWA_SERVICE_WORKER_PATH,
} from "@/lib/pwa/constants"

export function clearLegacyOfflineQueue(
  storage: Pick<Storage, "removeItem"> | undefined =
    typeof window !== "undefined" ? window.localStorage : undefined,
) {
  try {
    storage?.removeItem(LEGACY_OFFLINE_QUEUE_KEY)
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function isApiMockingEnabled(value: string | undefined) {
  return value?.toLowerCase() === "enabled"
}

export function shouldRegisterGymMasterPwa(
  nodeEnvironment: string | undefined,
  apiMocking: string | undefined,
) {
  return nodeEnvironment === "production" && !isApiMockingEnabled(apiMocking)
}

function isGymMasterPwaWorker(worker: ServiceWorker | null | undefined) {
  if (!worker) return false

  try {
    return new URL(worker.scriptURL, window.location.href).pathname === PWA_SERVICE_WORKER_PATH
  } catch {
    return false
  }
}

export function isGymMasterPwaRegistration(registration: ServiceWorkerRegistration) {
  return [registration.active, registration.installing, registration.waiting].some(
    isGymMasterPwaWorker,
  )
}

export async function cleanupGymMasterPwaState(
  serviceWorker: ServiceWorkerContainer | undefined =
    typeof navigator !== "undefined" ? navigator.serviceWorker : undefined,
  cacheStorage: CacheStorage | undefined =
    typeof window !== "undefined" ? window.caches : undefined,
) {
  const registrationCleanup = async () => {
    if (!serviceWorker) return

    const registrations = await serviceWorker.getRegistrations()
    await Promise.allSettled(
      registrations
        .filter(isGymMasterPwaRegistration)
        .map((registration) => registration.unregister()),
    )
  }

  const cacheCleanup = async () => {
    if (!cacheStorage) return

    const cacheNames = await cacheStorage.keys()
    await Promise.allSettled(
      cacheNames
        .filter((cacheName) => cacheName.startsWith(PWA_CACHE_PREFIX))
        .map((cacheName) => cacheStorage.delete(cacheName)),
    )
  }

  await Promise.allSettled([registrationCleanup(), cacheCleanup()])
}
