"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState, type ReactNode } from "react"
import { Toaster } from "sonner"

import { createQueryClient } from "@/lib/query/query-client"

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
    if (process.env.NEXT_PUBLIC_API_MOCKING?.toLowerCase() !== "enabled") {
      return
    }

    void import("@/mocks/browser").then(({ worker }) => {
      void worker.start({ onUnhandledRequest: "bypass" }).then(() => {
        window.__GYMMASTER_MSW_READY__ = true
      })
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </QueryClientProvider>
  )
}
