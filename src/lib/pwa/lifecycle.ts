import { PWA_SERVICE_WORKER_PATH } from "@/lib/pwa/constants"
import { shouldRegisterGymMasterPwa } from "@/lib/pwa/service-worker-client"

type PwaLifecycleOptions = {
  apiMocking: string | undefined
  nodeEnvironment: string | undefined
  onUpdateReady: (activate: () => void) => void
  reload: () => void
  serviceWorker: ServiceWorkerContainer | undefined
}
export async function startGymMasterPwaLifecycle({
  apiMocking,
  nodeEnvironment,
  onUpdateReady,
  reload,
  serviceWorker,
}: PwaLifecycleOptions): Promise<() => void> {
  if (!serviceWorker || !shouldRegisterGymMasterPwa(nodeEnvironment, apiMocking)) {
    return () => undefined
  }

  let reloadAfterActivation = false
  let hasReloaded = false
  let trackedInstallingWorker: ServiceWorker | null = null

  const handleControllerChange = () => {
    if (!reloadAfterActivation || hasReloaded) return

    hasReloaded = true
    reload()
  }

  serviceWorker.addEventListener("controllerchange", handleControllerChange)

  let registration: ServiceWorkerRegistration
  try {
    registration = await serviceWorker.register(PWA_SERVICE_WORKER_PATH, {
      scope: "/",
      updateViaCache: "none",
    })
  } catch (error) {
    serviceWorker.removeEventListener("controllerchange", handleControllerChange)
    throw error
  }

  const offerUpdate = (worker: ServiceWorker) => {
    onUpdateReady(() => {
      reloadAfterActivation = true
      worker.postMessage({ type: "SKIP_WAITING" })
    })
  }

  const handleInstallingStateChange = () => {
    if (trackedInstallingWorker?.state === "installed" && serviceWorker.controller) {
      offerUpdate(trackedInstallingWorker)
    }
  }

  const handleUpdateFound = () => {
    trackedInstallingWorker?.removeEventListener("statechange", handleInstallingStateChange)
    trackedInstallingWorker = registration.installing
    trackedInstallingWorker?.addEventListener("statechange", handleInstallingStateChange)
  }

  registration.addEventListener("updatefound", handleUpdateFound)

  if (registration.waiting && serviceWorker.controller) {
    offerUpdate(registration.waiting)
  }

  return () => {
    trackedInstallingWorker?.removeEventListener("statechange", handleInstallingStateChange)
    registration.removeEventListener("updatefound", handleUpdateFound)
    serviceWorker.removeEventListener("controllerchange", handleControllerChange)
  }
}
