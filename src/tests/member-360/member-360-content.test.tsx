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

    // The hero should show with empty props (no crash)
    expect(screen.getByText("Hồ sơ hội viên")).toBeInTheDocument()
    expect(screen.getByText("Chưa có gói hội viên active")).toBeInTheDocument()
    expect(screen.getByText("Chưa phân công PT")).toBeInTheDocument()
    expect(screen.getByText("Chưa có lượt check-in")).toBeInTheDocument()
  })
})
