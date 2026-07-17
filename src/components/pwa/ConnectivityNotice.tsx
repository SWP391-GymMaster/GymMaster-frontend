"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

export function ConnectivityNotice() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateConnectivity = () => setIsOnline(navigator.onLine)

    updateConnectivity()
    window.addEventListener("online", updateConnectivity)
    window.addEventListener("offline", updateConnectivity)

    return () => {
      window.removeEventListener("online", updateConnectivity)
      window.removeEventListener("offline", updateConnectivity)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex justify-center"
      role="status"
    >
      <div className="flex min-h-11 max-w-xl items-center gap-3 rounded-full border border-amber-300/30 bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
        <WifiOff aria-hidden="true" className="size-4 shrink-0 text-amber-300" />
        Bạn đang ngoại tuyến. Các thao tác đồng bộ với hệ thống cần kết nối mạng.
      </div>
    </div>
  )
}
