import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RoleBadge } from "@/components/data/RoleBadge"

describe("RoleBadge", () => {
  it("displays only the current role", () => {
    render(<RoleBadge role="member" />)

    expect(screen.getByText("Member")).toBeInTheDocument()
    expect(screen.queryByText("Admin")).not.toBeInTheDocument()
    expect(screen.queryByText("Staff")).not.toBeInTheDocument()
    expect(screen.queryByText("PT")).not.toBeInTheDocument()
  })
})
