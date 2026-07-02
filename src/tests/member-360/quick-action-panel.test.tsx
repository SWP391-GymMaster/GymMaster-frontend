import { render, screen } from "@testing-library/react"
import { ClipboardList } from "lucide-react"
import { describe, expect, it } from "vitest"

import {
  QuickActionPanel,
  getAdminActions,
  getMemberActions,
  getPtActions,
  getStaffActions,
} from "@/features/member-360/components/QuickActionPanel"

describe("QuickActionPanel", () => {
  it("renders action links", () => {
    render(
      <QuickActionPanel
        actions={[
          { href: "/test", label: "Test action", icon: ClipboardList },
        ]}
      />,
    )

    expect(screen.getByText("Test action")).toBeInTheDocument()
  })

  it("renders empty state when no actions", () => {
    render(<QuickActionPanel actions={[]} />)

    expect(screen.getByText("Chưa có thao tác khả dụng")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <QuickActionPanel
        actions={[{ href: "/test", label: "Test", icon: ClipboardList }]}
        className="custom-class"
      />,
    )

    expect((container.firstChild as HTMLElement).className).toContain("custom-class")
  })
})

describe("getPtActions", () => {
  it("returns PT actions for a member", () => {
    const actions = getPtActions(101)

    expect(actions).toHaveLength(3)
    expect(actions[0].label).toBe("Ghi chú PT")
    expect(actions[1].label).toBe("Thiết kế giáo án")
    expect(actions[2].label).toBe("Xem tiến độ")
  })
})

describe("getAdminActions", () => {
  it("returns admin actions for a member", () => {
    const actions = getAdminActions(101)

    expect(actions).toHaveLength(3)
    expect(actions[0].label).toBe("Phân công PT")
    expect(actions[1].label).toBe("Quản lý hội viên")
    expect(actions[2].label).toBe("Gia hạn gói")
  })
})

describe("getStaffActions", () => {
  it("returns staff actions for a member", () => {
    const actions = getStaffActions(101, "GM-101")

    expect(actions).toHaveLength(3)
    expect(actions[0].label).toBe("Check-in")
    expect(actions[1].label).toBe("Bán gói tập")
    expect(actions[1].href).toContain("memberId=101")
    expect(actions[2].label).toBe("Gia hạn gói")
  })
})

describe("getMemberActions", () => {
  it("returns member self-service actions", () => {
    const actions = getMemberActions()

    expect(actions.map((action) => action.href)).toEqual([
      "/member/membership",
      "/member/progress",
      "/member/workout",
      "/member/notes",
    ])
  })
})
