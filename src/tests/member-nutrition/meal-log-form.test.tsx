import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { MealLogForm } from "@/features/member-nutrition/components/MealLogForm"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("MealLogForm", () => {
  it("requires a selected food before submit", async () => {
    renderWithMemberSession(<MealLogForm date="2026-06-02" />)

    fireEvent.click(screen.getByTestId("member-add-meal-button"))

    expect(await screen.findByText("Chọn món ăn.")).toBeInTheDocument()
  })

  it("requires quantity greater than zero", async () => {
    renderWithMemberSession(<MealLogForm date="2026-06-02" />)

    fireEvent.change(screen.getByTestId("member-food-search-input"), {
      target: { value: "banana" },
    })
    fireEvent.click(await screen.findByText("Banana"))
    fireEvent.change(screen.getByTestId("member-meal-quantity-input"), {
      target: { value: "0" },
    })
    fireEvent.click(screen.getByTestId("member-add-meal-button"))

    expect(
      await screen.findByText("Khẩu phần phải lớn hơn 0."),
    ).toBeInTheDocument()
  })

  it("adds the selected food to the list then logs all on confirm", async () => {
    renderWithMemberSession(<MealLogForm date="2026-06-02" />)

    fireEvent.change(screen.getByTestId("member-food-search-input"), {
      target: { value: "banana" },
    })
    fireEvent.click(await screen.findByText("Banana"))
    fireEvent.change(screen.getByTestId("member-meal-quantity-input"), {
      target: { value: "2" },
    })
    fireEvent.click(screen.getByTestId("member-add-meal-button"))

    // Mon vao "gio", chua goi API.
    expect(
      await screen.findByText("Đã thêm vào danh sách: Banana"),
    ).toBeInTheDocument()

    // Xac nhan ghi tat ca 1 lan.
    fireEvent.click(screen.getByTestId("member-confirm-cart-button"))

    expect(
      await screen.findByText("Đã ghi 1 món vào nhật ký"),
    ).toBeInTheDocument()
  })
})
