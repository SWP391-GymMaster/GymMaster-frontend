"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { PWA_INSTALL_DISMISSAL_KEY } from "@/lib/pwa/constants"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type InstallMode = "prompt" | "ios" | null

type PwaInstallContextValue = {
  dismiss: () => void
  install: () => Promise<void>
  mode: InstallMode
}

const PwaInstallContext = createContext<PwaInstallContextValue>({
  dismiss: () => undefined,
  install: async () => undefined,
  mode: null,
})

function isStandaloneMode() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return (
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches) ||
    navigatorWithStandalone.standalone === true
  )
}

function isIosDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [mode, setMode] = useState<InstallMode>(null)

  const dismiss = useCallback(() => {
    window.localStorage.setItem(PWA_INSTALL_DISMISSAL_KEY, "true")
    setDeferredPrompt(null)
    setMode(null)
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return

    let choice: Awaited<BeforeInstallPromptEvent["userChoice"]>
    try {
      await deferredPrompt.prompt()
      choice = await deferredPrompt.userChoice
    } catch {
      return
    }

    if (choice.outcome === "accepted") {
      window.localStorage.removeItem(PWA_INSTALL_DISMISSAL_KEY)
      setDeferredPrompt(null)
      setMode(null)
      return
    }

    dismiss()
  }, [deferredPrompt, dismiss])

  useEffect(() => {
    let active = true
    const dismissed = window.localStorage.getItem(PWA_INSTALL_DISMISSAL_KEY) === "true"
    const standalone = isStandaloneMode()

    if (!dismissed && !standalone && isIosDevice()) {
      queueMicrotask(() => {
        if (active) setMode("ios")
      })
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      if (
        isStandaloneMode() ||
        window.localStorage.getItem(PWA_INSTALL_DISMISSAL_KEY) === "true"
      ) {
        return
      }

      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setMode("prompt")
    }

    const handleAppInstalled = () => {
      window.localStorage.removeItem(PWA_INSTALL_DISMISSAL_KEY)
      setDeferredPrompt(null)
      setMode(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      active = false
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const value = useMemo(
    () => ({ dismiss, install, mode }),
    [dismiss, install, mode],
  )

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
}

export function usePwaInstall() {
  return useContext(PwaInstallContext)
}
