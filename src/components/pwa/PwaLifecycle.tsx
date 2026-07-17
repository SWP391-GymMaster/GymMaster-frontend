"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import { PWA_UPDATE_TOAST_ID } from "@/lib/pwa/constants"
import { startGymMasterPwaLifecycle } from "@/lib/pwa/lifecycle"
import { clearLegacyOfflineQueue } from "@/lib/pwa/service-worker-client"

export function PwaLifecycle() {
  useEffect(() => {
    clearLegacyOfflineQueue()
    const serviceWorker =
      "serviceWorker" in navigator ? navigator.serviceWorker : undefined
    let cancelled = false
    let stopLifecycle: (() => void) | undefined

    void startGymMasterPwaLifecycle({
      apiMocking: process.env.NEXT_PUBLIC_API_MOCKING,
      nodeEnvironment: process.env.NODE_ENV,
      serviceWorker,
      reload: () => window.location.reload(),
      onUpdateReady: (activate) => {
        toast("GymMaster có phiên bản mới", {
          id: PWA_UPDATE_TOAST_ID,
          description: "Cập nhật khi bạn đã hoàn tất thao tác đang làm.",
          duration: Number.POSITIVE_INFINITY,
          closeButton: true,
          action: {
            label: "Cập nhật",
            onClick: activate,
          },
          cancel: {
            label: "Để sau",
            onClick: () => toast.dismiss(PWA_UPDATE_TOAST_ID),
          },
        })
      },
    })
      .then((stop) => {
        if (cancelled) {
          stop()
          return
        }
        stopLifecycle = stop
      })
      .catch((error: unknown) => {
        console.warn("GymMaster PWA registration failed:", error)
      })

    return () => {
      cancelled = true
      stopLifecycle?.()
    }
  }, [])

  return null
}
