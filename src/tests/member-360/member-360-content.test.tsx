import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Member360Content } from "@/features/member-360/components/Member360Content"
import { useMemberProgress } from "@/features/member-progress-tracking/api/member-progress.queries"
import { useMemberCheckIns } from "@/features/billing/api/billing.queries"
import { useMemberWorkoutPlans, useMemberTrainerNotes } from "@/features/pt-training/api/pt-training.queries"

vi.mock("@/features/member-progress-tracking/api/member-progress.queries")
vi.mock("@/features/billing/api/billing.queries")
vi.mock("@/features/pt-training/api/pt-training.queries")

describe("Member360Content", () => {
  beforeEach(() => {
    vi.mocked(useMemberProgress).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMemberProgress>)

    vi.mocked(useMemberCheckIns).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMemberCheckIns>)

    vi.mocked(useMemberWorkoutPlans).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMemberWorkoutPlans>)

    vi.mocked(useMemberTrainerNotes).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMemberTrainerNotes>)
  })

  it("renders loading state", () => {
    const { container } = render(
      <Member360Content isLoading viewContext="admin" />,
    )

    const pulses = container.querySelectorAll(".animate-pulse")
    expect(pulses.length).toBeGreaterThan(0)
  })

  it("renders error state", () => {
    render(
      <Member360Content
        error={new Error("Failed to load member data")}
        viewContext="admin"
      />,
    )

    expect(
      screen.getByText("Failed to load member data"),
    ).toBeInTheDocument()
  })

  it("renders error state with retry", () => {
    render(
      <Member360Content
        error={new Error("Error")}
        onRetry={() => {}}
        viewContext="admin"
      />,
    )

    expect(screen.getByText("Thử lại")).toBeInTheDocument()
  })

  it("renders empty data gracefully", () => {
    render(<Member360Content viewContext="admin" />)

    expect(screen.getByText("Không có dữ liệu hồ sơ.")).toBeInTheDocument()
    expect(
      screen.getByText("Chọn một hội viên hợp lệ hoặc quay lại danh sách để tìm hồ sơ khác."),
    ).toBeInTheDocument()
  })
})
