import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RoleBadge } from "@/components/data/RoleBadge"

describe("RoleBadge", () => {
  it("displays only the current role", () => {
    render(<RoleBadge role="member" />)

    expect(screen.getByText("Hội viên")).toBeInTheDocument()
    expect(screen.queryByText("Quản trị")).not.toBeInTheDocument()
    expect(screen.queryByText("Lễ tân")).not.toBeInTheDocument()
    expect(screen.queryByText("PT")).not.toBeInTheDocument()
  })
})
