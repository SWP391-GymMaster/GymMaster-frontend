import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RoleBadge } from "@/components/data/RoleBadge"

describe("RoleBadge", () => {
  it("displays only the current role", () => {
    render(<RoleBadge role="member" />)

    expect(screen.getByText("Hội viên")).toBeInTheDocument()
    expect(screen.queryByText("Quản trị viên")).not.toBeInTheDocument()
    expect(screen.queryByText("Nhân viên lễ tân")).not.toBeInTheDocument()
    expect(screen.queryByText("Huấn luyện viên PT")).not.toBeInTheDocument()
  })
})
