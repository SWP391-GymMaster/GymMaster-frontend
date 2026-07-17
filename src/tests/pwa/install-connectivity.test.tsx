import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ConnectivityNotice } from "@/components/pwa/ConnectivityNotice"
import { InstallAppAction } from "@/components/pwa/InstallAppAction"
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider"
import { PWA_INSTALL_DISMISSAL_KEY } from "@/lib/pwa/constants"

function setNavigatorProperty(name: string, value: unknown) {
  Object.defineProperty(window.navigator, name, {
    configurable: true,
    value,
  })
}

function setStandalone(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches,
      media: "(display-mode: standalone)",
      removeEventListener: vi.fn(),
    }),
  })
}

function createInstallEvent(outcome: "accepted" | "dismissed" = "accepted") {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn>
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  }
  event.prompt = vi.fn(async () => undefined)
  event.userChoice = Promise.resolve({ outcome, platform: "web" })
  return event
}

function renderInstallAction() {
  return render(
    <PwaInstallProvider>
      <InstallAppAction />
    </PwaInstallProvider>,
  )
}

describe("InstallAppAction", () => {
  beforeEach(() => {
    window.localStorage.clear()
    setNavigatorProperty("userAgent", "Mozilla/5.0 Chrome/126.0")
    setNavigatorProperty("platform", "Win32")
    setNavigatorProperty("maxTouchPoints", 0)
    setStandalone(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("stays hidden until an eligible browser emits beforeinstallprompt", () => {
    renderInstallAction()

    expect(screen.queryByTestId("pwa-install-action")).not.toBeInTheDocument()
  })

  it("invokes the captured browser prompt only after the install button is activated", async () => {
    renderInstallAction()
    const installEvent = createInstallEvent("accepted")

    act(() => window.dispatchEvent(installEvent))
    const installButton = screen.getByRole("button", { name: "Cài ứng dụng" })
    installButton.focus()
    expect(installButton).toHaveFocus()
    expect(installEvent.prompt).not.toHaveBeenCalled()

    fireEvent.click(installButton)
    await waitFor(() => expect(installEvent.prompt).toHaveBeenCalledOnce())
    await waitFor(() =>
      expect(screen.queryByTestId("pwa-install-action")).not.toBeInTheDocument(),
    )
  })

  it("persists dismissal for the current PWA release", () => {
    renderInstallAction()
    act(() => window.dispatchEvent(createInstallEvent()))

    fireEvent.click(screen.getByRole("button", { name: "Ẩn gợi ý cài đặt" }))

    expect(window.localStorage.getItem(PWA_INSTALL_DISMISSAL_KEY)).toBe("true")
    expect(screen.queryByTestId("pwa-install-action")).not.toBeInTheDocument()
  })

  it("shows iOS manual Share guidance without a programmatic install button", async () => {
    setNavigatorProperty("userAgent", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")
    setNavigatorProperty("platform", "iPhone")

    renderInstallAction()

    expect(await screen.findByText("Nhấn nút Chia sẻ.")).toBeInTheDocument()
    expect(screen.getByText("Chọn “Thêm vào Màn hình chính”.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Cài ứng dụng" })).not.toBeInTheDocument()
  })

  it("remains hidden in standalone mode even when the install event fires", () => {
    setStandalone(true)
    renderInstallAction()

    act(() => window.dispatchEvent(createInstallEvent()))

    expect(screen.queryByTestId("pwa-install-action")).not.toBeInTheDocument()
  })
})

describe("ConnectivityNotice", () => {
  beforeEach(() => {
    setNavigatorProperty("onLine", true)
  })

  it("announces offline status and disappears after connectivity returns", () => {
    render(<ConnectivityNotice />)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()

    setNavigatorProperty("onLine", false)
    act(() => window.dispatchEvent(new Event("offline")))
    expect(screen.getByRole("status")).toHaveTextContent("Các thao tác đồng bộ với hệ thống cần kết nối mạng")

    setNavigatorProperty("onLine", true)
    act(() => window.dispatchEvent(new Event("online")))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
