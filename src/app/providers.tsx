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
  // Chi cho o che do mock: khong render children truoc khi MSW san sang.
  // Truoc day children render ngay, con worker.start() chay bat dong bo -> trang
  // nao goi API ngay trong useEffect luc mount (vd /member/membership/vnpay-return)
  // se ban request truoc khi MSW kip bat; onUnhandledRequest:"bypass" cho no lot
  // ra mang that roi hong -> trang hien man loi. Cac trang dung react-query thoat
  // nan nho co retry, nen loi nay an rat lau.
  const [mockReady, setMockReady] = useState(
    () => !isApiMockingEnabled(process.env.NEXT_PUBLIC_API_MOCKING),
  )

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
        setMockReady(true)
      }
    }

    void startMocking().catch((error: unknown) => {
      console.error("GymMaster MSW startup failed:", error)
      // Bat dau that bai thi van phai render, khong de trang trang vinh vien.
      if (!cancelled) {
        setMockReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <PwaInstallProvider>
        <PwaLifecycle />
        {mockReady ? children : null}
        <ConnectivityNotice />
        <Toaster richColors closeButton position="top-right" />
      </PwaInstallProvider>
    </QueryClientProvider>
  )
}
