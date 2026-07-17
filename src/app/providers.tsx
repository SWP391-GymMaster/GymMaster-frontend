"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState, type ReactNode } from "react"
import { Toaster } from "sonner"

import { PwaLifecycle } from "@/components/pwa/PwaLifecycle"
import { ConnectivityNotice } from "@/components/pwa/ConnectivityNotice"
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider"
import { createQueryClient } from "@/lib/query/query-client"
import {
  cleanupGymMasterPwaState,
  isApiMockingEnabled,
} from "@/lib/pwa/service-worker-client"

type AppProvidersProps = {
  children: ReactNode
}

declare global {
  interface Window {
    __GYMMASTER_MSW_READY__?: boolean
  }
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient())

  useEffect(() => {
    if (!isApiMockingEnabled(process.env.NEXT_PUBLIC_API_MOCKING)) {
      return
    }

    let cancelled = false
    window.__GYMMASTER_MSW_READY__ = false

    const startMocking = async () => {
      await cleanupGymMasterPwaState()
      if (cancelled) return

      const { worker } = await import("@/mocks/browser")
      if (cancelled) return

      await worker.start({ onUnhandledRequest: "bypass" })
      if (!cancelled) {
        window.__GYMMASTER_MSW_READY__ = true
      }
    }

    void startMocking().catch((error: unknown) => {
      console.error("GymMaster MSW startup failed:", error)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <PwaInstallProvider>
        <PwaLifecycle />
        {children}
        <ConnectivityNotice />
        <Toaster richColors closeButton position="top-right" />
      </PwaInstallProvider>
    </QueryClientProvider>
  )
}
