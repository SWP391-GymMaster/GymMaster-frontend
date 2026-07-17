import { describe, expect, it, vi } from "vitest"

import { startGymMasterPwaLifecycle } from "@/lib/pwa/lifecycle"
import {
  clearLegacyOfflineQueue,
  cleanupGymMasterPwaState,
  shouldRegisterGymMasterPwa,
} from "@/lib/pwa/service-worker-client"

class WorkerMock extends EventTarget {
  scriptURL: string
  state: ServiceWorkerState = "installed"
  postMessage = vi.fn()

  constructor(scriptURL: string) {
    super()
    this.scriptURL = scriptURL
  }
}

class RegistrationMock extends EventTarget {
  active: WorkerMock | null = null
  installing: WorkerMock | null = null
  waiting: WorkerMock | null = null
  unregister = vi.fn(async () => true)
}

class ServiceWorkerContainerMock extends EventTarget {
  controller: ServiceWorker | null = null
  registrations: RegistrationMock[] = []
  register = vi.fn(async () => this.registrations[0] as unknown as ServiceWorkerRegistration)
  getRegistrations = vi.fn(
    async () => this.registrations as unknown as ServiceWorkerRegistration[],
  )
}

describe("GymMaster PWA lifecycle", () => {
  it("registers only in production when API mocking is disabled", () => {
    expect(shouldRegisterGymMasterPwa("production", undefined)).toBe(true)
    expect(shouldRegisterGymMasterPwa("production", "disabled")).toBe(true)
    expect(shouldRegisterGymMasterPwa("production", "enabled")).toBe(false)
    expect(shouldRegisterGymMasterPwa("development", undefined)).toBe(false)
    expect(shouldRegisterGymMasterPwa("test", undefined)).toBe(false)
  })

  it("removes the obsolete simulated offline queue", () => {
    const storage = { removeItem: vi.fn() }

    clearLegacyOfflineQueue(storage)

    expect(storage.removeItem).toHaveBeenCalledWith("gymmaster-offline-queue")
  })

  it("registers /sw.js without presenting a first-install update", async () => {
    const container = new ServiceWorkerContainerMock()
    container.registrations = [new RegistrationMock()]
    const onUpdateReady = vi.fn()

    const stop = await startGymMasterPwaLifecycle({
      apiMocking: undefined,
      nodeEnvironment: "production",
      onUpdateReady,
      reload: vi.fn(),
      serviceWorker: container as unknown as ServiceWorkerContainer,
    })

    expect(container.register).toHaveBeenCalledWith("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    })
    expect(onUpdateReady).not.toHaveBeenCalled()
    stop()
  })

  it("offers a waiting update and reloads exactly once only after activation", async () => {
    const container = new ServiceWorkerContainerMock()
    const registration = new RegistrationMock()
    const waitingWorker = new WorkerMock("http://localhost/sw.js")
    registration.waiting = waitingWorker
    container.registrations = [registration]
    container.controller = new WorkerMock("http://localhost/sw.js") as unknown as ServiceWorker
    const reload = vi.fn()
    let activate: (() => void) | undefined

    const stop = await startGymMasterPwaLifecycle({
      apiMocking: undefined,
      nodeEnvironment: "production",
      onUpdateReady: (nextActivate) => {
        activate = nextActivate
      },
      reload,
      serviceWorker: container as unknown as ServiceWorkerContainer,
    })

    expect(waitingWorker.postMessage).not.toHaveBeenCalled()
    container.dispatchEvent(new Event("controllerchange"))
    expect(reload).not.toHaveBeenCalled()

    activate?.()
    expect(waitingWorker.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" })
    container.dispatchEvent(new Event("controllerchange"))
    container.dispatchEvent(new Event("controllerchange"))
    expect(reload).toHaveBeenCalledOnce()
    stop()
  })

  it("keeps the current client when an update is deferred", async () => {
    const container = new ServiceWorkerContainerMock()
    const registration = new RegistrationMock()
    registration.waiting = new WorkerMock("http://localhost/sw.js")
    container.registrations = [registration]
    container.controller = new WorkerMock("http://localhost/sw.js") as unknown as ServiceWorker
    const reload = vi.fn()

    const stop = await startGymMasterPwaLifecycle({
      apiMocking: undefined,
      nodeEnvironment: "production",
      onUpdateReady: vi.fn(),
      reload,
      serviceWorker: container as unknown as ServiceWorkerContainer,
    })

    container.dispatchEvent(new Event("controllerchange"))
    expect(reload).not.toHaveBeenCalled()
    stop()
  })

  it("removes only GymMaster PWA registrations and caches before MSW startup", async () => {
    const container = new ServiceWorkerContainerMock()
    const pwaRegistration = new RegistrationMock()
    pwaRegistration.active = new WorkerMock("http://localhost/sw.js")
    const mswRegistration = new RegistrationMock()
    mswRegistration.active = new WorkerMock("http://localhost/mockServiceWorker.js")
    container.registrations = [pwaRegistration, mswRegistration]

    const cacheStorage = {
      delete: vi.fn(async () => true),
      keys: vi.fn(async () => ["gymmaster-pwa-static-v0", "msw-unrelated"]),
    } as unknown as CacheStorage

    await cleanupGymMasterPwaState(
      container as unknown as ServiceWorkerContainer,
      cacheStorage,
    )

    expect(pwaRegistration.unregister).toHaveBeenCalledOnce()
    expect(mswRegistration.unregister).not.toHaveBeenCalled()
    expect(cacheStorage.delete).toHaveBeenCalledWith("gymmaster-pwa-static-v0")
    expect(cacheStorage.delete).not.toHaveBeenCalledWith("msw-unrelated")
  })

  it("does not block mock startup when stale PWA cleanup is rejected", async () => {
    const container = new ServiceWorkerContainerMock()
    container.getRegistrations.mockRejectedValueOnce(new Error("registration cleanup denied"))
    const cacheStorage = {
      delete: vi.fn(async () => true),
      keys: vi.fn(async () => {
        throw new Error("cache cleanup denied")
      }),
    } as unknown as CacheStorage

    await expect(
      cleanupGymMasterPwaState(
        container as unknown as ServiceWorkerContainer,
        cacheStorage,
      ),
    ).resolves.toBeUndefined()
  })
})
