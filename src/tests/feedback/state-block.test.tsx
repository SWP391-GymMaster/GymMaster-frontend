import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StateBlock } from "@/components/feedback/StateBlock"

describe("StateBlock", () => {
  it("renders loading and empty states as status messages", () => {
    render(
      <>
        <StateBlock
          description="Checking member records."
          title="Loading member matches..."
          tone="loading"
        />
        <StateBlock
          description="Try another lookup."
          title="No member found."
          tone="empty"
        />
      </>,
    )

    expect(screen.getAllByRole("status")).toHaveLength(2)
    expect(screen.getByText("Loading member matches...")).toBeInTheDocument()
    expect(screen.getByText("No member found.")).toBeInTheDocument()
  })

  it("renders errors as alerts", () => {
    render(
      <StateBlock
        description="Try again."
        title="Could not complete the action."
        tone="error"
      />,
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not complete the action.",
    )
  })
})
