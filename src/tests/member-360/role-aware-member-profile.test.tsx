import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { getMemberActions } from "@/features/member-360/components/QuickActionPanel"
import { RoleAwareMemberProfile } from "@/features/member-360/components/RoleAwareMemberProfile"

describe("RoleAwareMemberProfile", () => {
  it("renders member self-service actions without staff/admin actions", () => {
    render(
      <RoleAwareMemberProfile
        actions={getMemberActions()}
        member={{
          id: 101,
          email: "member@gymmaster.local",
          fullName: "Nguyen Minh Anh",
          memberCode: "GM-101",
          phone: "0900000101",
          status: "active",
        }}
        membership={{
          endDate: "2026-07-30",
          packageName: "Pro",
          paymentStatus: "paid",
          startDate: "2026-07-01",
          status: "active",
          supportsPT: true,
        }}
        viewContext="member"
      />,
    )

    expect(screen.getByTestId("member-profile-member")).toBeInTheDocument()
    expect(screen.getByText("Gói tập của tôi")).toBeInTheDocument()
    expect(screen.getAllByText("Tiến độ").length).toBeGreaterThan(0)
    expect(screen.queryByText("Phân công PT")).not.toBeInTheDocument()
    expect(screen.queryByText("Bán gói tập")).not.toBeInTheDocument()
  })

  it("renders a safe unavailable state without profile data", () => {
    render(
      <RoleAwareMemberProfile
        unavailable={{
          title: "Chưa có hồ sơ hội viên",
          description: "Tài khoản hiện tại chưa liên kết với hồ sơ hội viên.",
        }}
        viewContext="member"
      />,
    )

    expect(screen.getByText("Chưa có hồ sơ hội viên")).toBeInTheDocument()
    expect(
      screen.getByText("Tài khoản hiện tại chưa liên kết với hồ sơ hội viên."),
    ).toBeInTheDocument()
    expect(screen.queryByTestId("member-profile-member")).not.toBeInTheDocument()
  })
})
