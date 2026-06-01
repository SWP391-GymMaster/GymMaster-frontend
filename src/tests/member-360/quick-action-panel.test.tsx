import { render, screen } from "@testing-library/react"
import { ClipboardList } from "lucide-react"
import { describe, expect, it } from "vitest"

import {
  QuickActionPanel,
  getPtActions,
  getAdminActions,
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

    expect(screen.getByText("No actions available")).toBeInTheDocument()
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

    expect(actions).toHaveLength(2)
    expect(actions[0].label).toBe("Add trainer note")
    expect(actions[1].label).toBe("Create workout plan")
  })
})

describe("getAdminActions", () => {
  it("returns admin actions for a member", () => {
    const actions = getAdminActions(101)

    expect(actions).toHaveLength(2)
    expect(actions[0].label).toBe("Assign PT")
    expect(actions[1].label).toBe("Manage member")
  })
})

describe("getStaffActions", () => {
  it("returns staff actions for a member", () => {
    const actions = getStaffActions()

    expect(actions).toHaveLength(3)
    expect(actions[0].label).toBe("Check in")
    expect(actions[1].label).toBe("Sell package")
    expect(actions[2].label).toBe("Renew package")
  })
})
