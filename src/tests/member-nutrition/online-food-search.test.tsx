import { fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { FoodSearchPanel } from "@/features/member-nutrition/components/FoodSearchPanel"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

// Mock sonner toast preserving Toaster export
vi.mock("sonner", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn(),
    },
  }
})

afterEach(() => {
  resetAuthSessionForTest()
  vi.clearAllMocks()
})

describe("FoodSearchPanel Online Search", () => {
  it("renders online search link when local results are found", async () => {
    const onQueryChange = vi.fn()
    const onSelectFood = vi.fn()

    renderWithMemberSession(
      <FoodSearchPanel
        query="sữa"
        onQueryChange={onQueryChange}
        onSelectFood={onSelectFood}
      />
    )

    // Verify local results exist and link is visible
    expect(await screen.findByTestId("online-search-link")).toBeInTheDocument()
    expect(screen.getByText(/Không tìm thấy món bạn cần\? Thử tìm kiếm trực tuyến cho/i)).toBeInTheDocument()
  })

  it("triggers online search and shows results when clicking link", async () => {
    const onQueryChange = vi.fn()
    const onSelectFood = vi.fn()

    renderWithMemberSession(
      <FoodSearchPanel
        query="sữa"
        onQueryChange={onQueryChange}
        onSelectFood={onSelectFood}
      />
    )

    // Wait for the link and click it
    const link = await screen.findByTestId("online-search-link")
    fireEvent.click(link)

    // Wait for the online search results heading
    expect(await screen.findByText("Kết quả trực tuyến từ Open Food Facts")).toBeInTheDocument()

    // Verify the mock online products are displayed
    expect(screen.getByText("Sữa tươi TH True Milk ít đường (TH True Milk)")).toBeInTheDocument()
    expect(screen.getByText("Sữa đậu nành Fami nguyên chất (Fami)")).toBeInTheDocument()
  })

  it("renders prominent online search button when local results are empty", async () => {
    const onQueryChange = vi.fn()
    const onSelectFood = vi.fn()

    renderWithMemberSession(
      <FoodSearchPanel
        query="mì tôm"
        onQueryChange={onQueryChange}
        onSelectFood={onSelectFood}
      />
    )

    // Verify the prominent search button is visible
    const btn = await screen.findByTestId("online-search-trigger-btn")
    expect(btn).toBeInTheDocument()
    expect(screen.getByText(/Tìm kiếm trực tuyến cho/i)).toBeInTheDocument()

    // Click it to run online search
    fireEvent.click(btn)

    // Verify the mock online products are displayed
    expect(await screen.findByText("Mì Hảo Hảo chua cay (Acecook)")).toBeInTheDocument()
  })

  it("opens preview dialog and allows confirmation of selected online food", async () => {
    const onQueryChange = vi.fn()
    const onSelectFood = vi.fn()

    renderWithMemberSession(
      <FoodSearchPanel
        query="mì tôm"
        onQueryChange={onQueryChange}
        onSelectFood={onSelectFood}
      />
    )

    const btn = await screen.findByTestId("online-search-trigger-btn")
    fireEvent.click(btn)

    const foodResult = await screen.findByText("Mì Hảo Hảo chua cay (Acecook)")
    fireEvent.click(foodResult.closest("button")!)

    // Verify dialog opened
    expect(await screen.findByText("Xem trước dinh dưỡng sản phẩm")).toBeInTheDocument()

    // Verify preview fields are populated
    const nameInput = screen.getByLabelText("Tên sản phẩm") as HTMLInputElement
    const unitInput = screen.getByLabelText("Đơn vị tính (Serving size)") as HTMLInputElement
    const caloriesInput = screen.getByLabelText("Calo mỗi đơn vị") as HTMLInputElement

    expect(nameInput.value).toBe("Mì Hảo Hảo chua cay (Acecook)")
    expect(unitInput.value).toBe("75g")
    expect(caloriesInput.value).toBe("466") // 466 parsed directly from energy-kcal_100g

    // Confirm selection
    const confirmBtn = screen.getByRole("button", { name: "Xác nhận và Chọn" })
    fireEvent.click(confirmBtn)

    // Should call onSelectFood with the created food item
    await waitFor(() => {
      expect(onSelectFood).toHaveBeenCalled()
    })
  })
})
