import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AppProviders } from "@/app/providers"

describe("AppProviders", () => {
  it("renders children inside the app provider tree", () => {
    render(
      <AppProviders>
        <p>Provider ready</p>
      </AppProviders>
    )

    expect(screen.getByText("Provider ready")).toBeInTheDocument()
  })
})
