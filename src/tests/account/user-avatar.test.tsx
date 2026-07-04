import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UserAvatar } from "@/components/data/UserAvatar"

class LoadedImage {
  onload: (() => void) | null = null
  private listeners = new Set<() => void>()

  addEventListener(event: string, listener: () => void) {
    if (event === "load") {
      this.listeners.add(listener)
    }
  }

  removeEventListener(event: string, listener: () => void) {
    if (event === "load") {
      this.listeners.delete(listener)
    }
  }

  set src(_value: string) {
    setTimeout(() => {
      this.onload?.()
      this.listeners.forEach((listener) => listener())
    }, 0)
  }
}

describe("UserAvatar", () => {
  beforeEach(() => {
    vi.stubGlobal("Image", LoadedImage)
  })

  it("renders initials when no avatar URL is available", () => {
    render(<UserAvatar name="Nguyen Minh Anh" />)

    expect(screen.getByText("NM")).toBeInTheDocument()
  })

  it("renders the image when an avatar URL is available", async () => {
    render(
      <UserAvatar
        avatarUrl="https://cdn.gymmaster.local/avatars/user_4.webp"
        name="Nguyen Minh Anh"
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByRole("img", { name: /Ảnh đại diện của Nguyen Minh Anh/i }),
      ).toHaveAttribute(
        "src",
        "https://cdn.gymmaster.local/avatars/user_4.webp",
      )
    })
  })
})
