import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { WaterTrackerCard } from "@/features/member-nutrition/components/WaterTrackerCard"
import { LEGACY_OFFLINE_QUEUE_KEY } from "@/lib/pwa/constants"

describe("WaterTrackerCard local-only behavior", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("stores water locally without creating a simulated synchronization queue", async () => {
    render(<WaterTrackerCard />)

    expect(
      screen.getByText("Nhật ký nước chỉ được lưu cục bộ trên thiết bị này."),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "250ml" }))

    await waitFor(() => {
      const logs = JSON.parse(
        window.localStorage.getItem("gymmaster-water-logs") ?? "[]",
      ) as Array<{ amount: number }>
      expect(logs.some((log) => log.amount === 250)).toBe(true)
    })
    expect(window.localStorage.getItem(LEGACY_OFFLINE_QUEUE_KEY)).toBeNull()
    expect(screen.queryByText(/đồng bộ thành công/i)).not.toBeInTheDocument()
  })
})
