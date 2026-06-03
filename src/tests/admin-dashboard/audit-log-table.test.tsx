import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AuditLogTable } from "@/features/admin-dashboard/components/AuditLogTable"
import type { AuditLogEntry } from "@/features/admin-dashboard/types/admin-dashboard.types"

const mockLogs: AuditLogEntry[] = [
  {
    id: 1,
    userId: 1,
    userDisplayName: "Admin User",
    action: "SELL_MEMBERSHIP",
    createdAt: "2026-06-01T09:30:00.000Z",
    entityType: "membership",
    entityId: 201,
  },
  {
    id: 2,
    userId: 2,
    userDisplayName: "Staff User",
    action: "MEMBER_CHECK_IN",
    createdAt: "2026-05-31T08:15:00.000Z",
    entityType: "member",
    entityId: 101,
  },
]

describe("AuditLogTable", () => {
  it("renders audit log entries", () => {
    render(
      <AuditLogTable
        data={mockLogs}
        page={1}
        pageSize={10}
        total={2}
        onPageChange={() => {}}
      />,
    )

    expect(screen.getByText("Admin User")).toBeInTheDocument()
    expect(screen.getByText("Staff User")).toBeInTheDocument()
    expect(screen.getByText("SELL MEMBERSHIP")).toBeInTheDocument()
    expect(screen.getByText("MEMBER CHECK IN")).toBeInTheDocument()
  })

  it("renders loading skeleton", () => {
    const { container } = render(
      <AuditLogTable
        data={[]}
        isLoading
        page={1}
        pageSize={10}
        total={0}
        onPageChange={() => {}}
      />,
    )

    const skeletons = container.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders empty state when no data", () => {
    render(
      <AuditLogTable
        data={[]}
        page={1}
        pageSize={10}
        total={0}
        onPageChange={() => {}}
      />,
    )

    expect(
      screen.getByText("Không có audit log phù hợp với bộ lọc."),
    ).toBeInTheDocument()
  })

  it("shows pagination when multiple pages", () => {
    render(
      <AuditLogTable
        data={mockLogs}
        page={1}
        pageSize={2}
        total={20}
        onPageChange={() => {}}
      />,
    )

    expect(screen.getByText(/Trang 1 \/ 10/)).toBeInTheDocument()
    expect(screen.getByText("Sau")).toBeInTheDocument()
    expect(screen.getByText("Trước")).toBeInTheDocument()
  })

  it("hides pagination when single page", () => {
    render(
      <AuditLogTable
        data={mockLogs}
        page={1}
        pageSize={10}
        total={1}
        onPageChange={() => {}}
      />,
    )

    expect(screen.queryByText(/Page/)).not.toBeInTheDocument()
  })
})
