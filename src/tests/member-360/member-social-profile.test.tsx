import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { MemberSocialProfile } from "@/features/member-360/components/MemberSocialProfile"

vi.mock("@/features/member-progress-tracking/api/member-progress.queries", () => ({
  useMemberProgress: () => ({
    data: [
      {
        id: 1,
        memberId: 101,
        measuredAt: "2026-06-01",
        weightKg: 78.4,
        bodyFatPct: 20.1,
      },
      {
        id: 2,
        memberId: 101,
        measuredAt: "2026-06-29",
        weightKg: 74.8,
        bodyFatPct: 18.4,
      },
    ],
    isLoading: false,
  }),
}))

vi.mock("@/features/billing/api/billing.queries", () => ({
  useMemberCheckIns: () => ({
    data: [
      {
        id: 11,
        checkInAt: "2026-06-30T10:30:00.000Z",
        source: "front-desk",
      },
    ],
    isLoading: false,
  }),
}))

vi.mock("@/features/pt-training/api/pt-training.queries", () => ({
  useMemberTrainerNotes: () => ({
    data: [
      {
        id: 21,
        memberId: 101,
        trainerId: 301,
        content: "Giữ nhịp squat ổn định, tăng nhẹ volume tuần tới.",
        createdAt: "2026-06-29T16:00:00.000Z",
      },
    ],
    isLoading: false,
  }),
  useMemberWorkoutPlans: () => ({
    data: [
      {
        id: 31,
        memberId: 101,
        trainerId: 301,
        title: "Upper strength day",
        status: "active",
        createdAt: "2026-06-28T09:00:00.000Z",
        updatedAt: "2026-06-30T09:00:00.000Z",
        exercises: [
          { name: "Bench Press", sets: 4, reps: "8-10", orderIndex: 1 },
          { name: "Cable Row", sets: 4, reps: "10", orderIndex: 2 },
        ],
      },
    ],
    isLoading: false,
  }),
}))

const profileData = {
  member: {
    id: 101,
    email: "member@gymmaster.local",
    fullName: "Nguyen Minh Anh",
    memberCode: "GM-101",
    phone: "0900000101",
    status: "active" as const,
  },
  currentMembership: {
    id: 201,
    memberId: 101,
    packageId: 1,
    packageName: "Premium 30",
    paymentStatus: "paid" as const,
    startDate: "2026-06-01",
    endDate: "2026-07-01",
    status: "active" as const,
    supportsPT: true,
  },
  assignedPT: {
    id: 301,
    fullName: "Coach Minh",
    specialty: "Strength coaching",
    assignedAt: "2026-06-01",
  },
}

describe("MemberSocialProfile", () => {
  it("renders a social-style private member profile without cross-role workspace links", () => {
    render(<MemberSocialProfile data={profileData} />)

    expect(screen.getByTestId("member-social-profile")).toBeInTheDocument()
    expect(screen.getByText("Nguyen Minh Anh")).toBeInTheDocument()
    expect(screen.getByText("Strength days, clean meals, steady progress.")).toBeInTheDocument()
    expect(screen.getByText("Nhật ký gần đây")).toBeInTheDocument()
    expect(screen.getByText("Check-in phòng tập")).toBeInTheDocument()
    expect(
      screen
        .getAllByRole("link", { name: /Cập nhật tiến độ/i })
        .some((link) => link.getAttribute("href") === "/member/progress"),
    ).toBe(true)
    expect(screen.queryByRole("link", { name: /PT workspace/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Staff workspace/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Admin workspace/i })).not.toBeInTheDocument()
  })

  it("keeps unavailable state safe when member identity is missing", () => {
    render(
      <MemberSocialProfile
        unavailable={{
          title: "Chưa có hồ sơ hội viên",
          description: "Tài khoản hiện tại chưa liên kết với hồ sơ hội viên.",
        }}
      />,
    )

    expect(screen.getByText("Chưa có hồ sơ hội viên")).toBeInTheDocument()
    expect(screen.queryByTestId("member-social-profile")).not.toBeInTheDocument()
  })
})
