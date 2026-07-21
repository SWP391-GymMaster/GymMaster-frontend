import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { MealLogForm } from "@/features/member-nutrition/components/MealLogForm"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("MealLogForm", () => {
  it("does not show frontend-generated quick suggestions and keeps AI food scan", () => {
    renderWithMemberSession(<MealLogForm date="2026-06-02" />)

    expect(screen.queryByRole("button", { name: "ức gà" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "yến mạch" })).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Quét ảnh món ăn bằng AI" }),
    ).toBeInTheDocument()
  })

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

  it("keeps quantity input focused while typing multiple digits", async () => {
    renderWithMemberSession(<MealLogForm date="2026-06-02" />)

    fireEvent.change(screen.getByTestId("member-food-search-input"), {
      target: { value: "banana" },
    })
    fireEvent.click(await screen.findByText("Banana"))

    const quantityInput = screen.getByTestId("member-meal-quantity-input")
    quantityInput.focus()
    fireEvent.change(quantityInput, { target: { value: "3" } })

    expect(screen.getByTestId("member-meal-quantity-input")).toBe(quantityInput)
    expect(quantityInput).toHaveFocus()

    fireEvent.change(quantityInput, { target: { value: "35" } })
    fireEvent.change(quantityInput, { target: { value: "350" } })

    expect(quantityInput).toHaveFocus()
    expect(quantityInput).toHaveValue(350)
  })

  it("adds the selected food to the list then logs all on confirm", async () => {
    renderWithMemberSession(<MealLogForm date="2026-06-02" />)

    fireEvent.change(screen.getByTestId("member-food-search-input"), {
      target: { value: "banana" },
    })
    fireEvent.click(await screen.findByText("Banana"))
    // Giu khoi luong mac dinh (100g). Khong go lai o quantity de tranh dong mobile sheet
    // trong moi truong test (Radix Sheet) lam mat mon dang chon.
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
