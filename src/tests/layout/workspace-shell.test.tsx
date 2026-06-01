import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { WorkspaceShell } from "@/components/layout/WorkspaceShell"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

describe("WorkspaceShell", () => {
  it("does not render placeholder metrics when metrics are omitted", () => {
    render(
      <WorkspaceShell
        description="A protected workspace"
        role="staff"
        title="Staff Dashboard"
      >
        <p>Workspace content</p>
      </WorkspaceShell>,
    )

    expect(screen.getByText("Staff Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Workspace content")).toBeInTheDocument()
    expect(screen.queryByText("Protected shell ready")).not.toBeInTheDocument()
    expect(screen.queryByText("Backend role")).not.toBeInTheDocument()
    expect(screen.queryByText("Skeleton only")).not.toBeInTheDocument()
  })

  it("renders route-aware metrics when provided", () => {
    render(
      <WorkspaceShell
        description="A protected workspace"
        metrics={[
          { label: "Today operations", value: "Front desk ready", tone: "dark" },
          { label: "Access", value: "Staff only" },
        ]}
        role="staff"
        title="Staff Dashboard"
      />,
    )

    expect(screen.getByLabelText("Workspace metrics")).toBeInTheDocument()
    expect(screen.getByText("Today operations")).toBeInTheDocument()
    expect(screen.getByText("Front desk ready")).toBeInTheDocument()
    expect(screen.getByText("Access")).toBeInTheDocument()
    expect(screen.getByText("Staff only")).toBeInTheDocument()
    expect(screen.queryByText("Skeleton only")).not.toBeInTheDocument()
  })
})
