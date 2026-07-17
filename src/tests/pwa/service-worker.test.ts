import { readFileSync } from "node:fs"
import { join } from "node:path"
import vm from "node:vm"
import { beforeEach, describe, expect, it, vi } from "vitest"

import nextConfig from "../../../next.config"

type WorkerEvent = {
  data?: unknown
  request?: Request
  respondWith?: (response: Promise<Response>) => void
  waitUntil?: (promise: Promise<unknown>) => void
}

type WorkerListeners = Record<string, (event: WorkerEvent) => void>

function createWorkerHarness() {
  const listeners: WorkerListeners = {}
  const storedResponses = new Map<string, Response>()
  const cacheNames = ["gymmaster-pwa-static-v0", "gymmaster-pwa-static-v1", "msw-unrelated"]
  const deletedCaches: string[] = []
  const addedUrls: string[][] = []
  const cachePuts: string[] = []

  const cache = {
    addAll: vi.fn(async (urls: string[]) => {
      addedUrls.push(urls)
    }),
    match: vi.fn(async (request: Request | string) => {
      const key = typeof request === "string" ? request : request.url
      return storedResponses.get(key)
    }),
    put: vi.fn(async (request: Request, response: Response) => {
      cachePuts.push(request.url)
      storedResponses.set(request.url, response)
    }),
  }

  const caches = {
    open: vi.fn(async () => cache),
    keys: vi.fn(async () => cacheNames),
    delete: vi.fn(async (name: string) => {
      deletedCaches.push(name)
      return true
    }),
  }

  const claim = vi.fn(async () => undefined)
  const skipWaiting = vi.fn(async () => undefined)
  const fetchMock = vi.fn(async () => new Response("network", { status: 200 }))
  const worker = {
    location: { origin: "http://localhost" },
    clients: { claim },
    skipWaiting,
    addEventListener: (type: string, listener: (event: WorkerEvent) => void) => {
      listeners[type] = listener
    },
  }

  const context = vm.createContext({
    URL,
    Response,
    Promise,
    Set,
    caches,
    console,
    fetch: fetchMock,
    self: worker,
  })
  const source = readFileSync(join(process.cwd(), "public", "sw.js"), "utf8")
  vm.runInContext(source, context, { filename: "public/sw.js" })

  return {
    addedUrls,
    cache,
    cachePuts,
    claim,
    deletedCaches,
    fetchMock,
    listeners,
    skipWaiting,
    storedResponses,
  }
}

function request(url: string, init: { destination?: string; headers?: Record<string, string>; method?: string; mode?: string } = {}) {
  return {
    destination: init.destination ?? "",
    headers: new Headers(init.headers),
    method: init.method ?? "GET",
    mode: init.mode ?? "cors",
    url,
  } as Request
}

describe("GymMaster service worker", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("precaches only the approved offline and icon assets", async () => {
    const harness = createWorkerHarness()
    let pending = Promise.resolve()

    harness.listeners.install({ waitUntil: (promise) => (pending = promise as Promise<void>) })
    await pending

    expect(harness.addedUrls).toEqual([
      [
        "/offline.html",
        "/icons/gymmaster-192.png",
        "/icons/gymmaster-512.png",
        "/icons/gymmaster-maskable-512.png",
      ],
    ])
  })

  it("deletes only obsolete GymMaster caches and claims clients", async () => {
    const harness = createWorkerHarness()
    let pending = Promise.resolve()

    harness.listeners.activate({ waitUntil: (promise) => (pending = promise as Promise<void>) })
    await pending

    expect(harness.deletedCaches).toEqual(["gymmaster-pwa-static-v0"])
    expect(harness.claim).toHaveBeenCalledOnce()
  })

  it("caches an allowlisted immutable Next.js asset after a network hit", async () => {
    const harness = createWorkerHarness()
    const assetRequest = request("http://localhost/_next/static/chunks/app.js", { destination: "script" })
    let responsePromise: Promise<Response> | undefined

    harness.listeners.fetch({
      request: assetRequest,
      respondWith: (promise) => {
        responsePromise = promise
      },
    })
    await responsePromise

    expect(harness.fetchMock).toHaveBeenCalledWith(assetRequest)
    expect(harness.cachePuts).toEqual([assetRequest.url])
  })

  it.each([
    request("http://localhost/api/members"),
    request("http://localhost/_next/static/chunks/app.js", { method: "POST" }),
    request("https://api.example.com/assets/public.js", { destination: "script" }),
    request("http://localhost/member/dashboard?_rsc=abc"),
    request("http://localhost/member/dashboard", { headers: { "next-router-prefetch": "1" } }),
  ])("bypasses protected, mutation, cross-origin, and RSC traffic", (protectedRequest) => {
    const harness = createWorkerHarness()
    const respondWith = vi.fn()

    harness.listeners.fetch({ request: protectedRequest, respondWith })

    expect(respondWith).not.toHaveBeenCalled()
    expect(harness.fetchMock).not.toHaveBeenCalled()
    expect(harness.cachePuts).toHaveLength(0)
  })

  it("returns the offline document only when document navigation cannot reach the network", async () => {
    const harness = createWorkerHarness()
    const offlineResponse = new Response("offline", { status: 200 })
    harness.storedResponses.set("/offline.html", offlineResponse)
    harness.fetchMock.mockRejectedValueOnce(new TypeError("offline"))
    let responsePromise: Promise<Response> | undefined

    harness.listeners.fetch({
      request: request("http://localhost/member/dashboard", { destination: "document", mode: "navigate" }),
      respondWith: (promise) => {
        responsePromise = promise
      },
    })

    await expect(responsePromise).resolves.toBe(offlineResponse)
    expect(harness.fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: "http://localhost/member/dashboard" }),
      { cache: "no-store" },
    )
    expect(harness.cachePuts).toHaveLength(0)
  })

  it("activates a waiting worker only after receiving the explicit message", () => {
    const harness = createWorkerHarness()

    harness.listeners.message({ data: { type: "UNRELATED" } })
    expect(harness.skipWaiting).not.toHaveBeenCalled()

    harness.listeners.message({ data: { type: "SKIP_WAITING" } })
    expect(harness.skipWaiting).toHaveBeenCalledOnce()
  })
})

describe("GymMaster service-worker response headers", () => {
  it("serves /sw.js as uncacheable, self-only JavaScript", async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const workerRule = rules.find((rule) => rule.source === "/sw.js")
    const headers = Object.fromEntries(workerRule?.headers.map((header) => [header.key, header.value]) ?? [])

    expect(headers).toMatchObject({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Security-Policy": "default-src 'self'; script-src 'self'",
      "Content-Type": "application/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    })
  })
})
