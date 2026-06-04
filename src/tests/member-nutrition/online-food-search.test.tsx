import { fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { FoodSearchPanel } from "@/features/member-nutrition/components/FoodSearchPanel"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"
import { AppProviders } from "@/app/providers"

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

  it("enforces cooldown timer on the online search button after query changes", async () => {
    const onQueryChange = vi.fn()
    const onSelectFood = vi.fn()

    const { rerender } = renderWithMemberSession(
      <FoodSearchPanel
        query="mì tôm"
        onQueryChange={onQueryChange}
        onSelectFood={onSelectFood}
      />
    )

    const btn = await screen.findByTestId("online-search-trigger-btn")
    expect(btn).toBeInTheDocument()

    // Click to trigger online search
    fireEvent.click(btn)

    // Change the query prop so the button is rendered again (since onlineSearchTriggered is reset to false)
    rerender(
      <AppProviders>
        <FoodSearchPanel
          query="xyzabc"
          onQueryChange={onQueryChange}
          onSelectFood={onSelectFood}
        />
      </AppProviders>
    )

    // Find the new button and verify it is disabled and shows cooldown text
    const newBtn = await screen.findByTestId("online-search-trigger-btn")
    expect(newBtn).toBeDisabled()
    expect(screen.getByText(/Chờ \d+s để tìm trực tuyến.../i)).toBeInTheDocument()
  })

  it("displays amber warning banner and OFF source badge on online search results", async () => {
    const onQueryChange = vi.fn()
    const onSelectFood = vi.fn()

    renderWithMemberSession(
      <FoodSearchPanel
        query="sữa"
        onQueryChange={onQueryChange}
        onSelectFood={onSelectFood}
      />
    )

    const link = await screen.findByTestId("online-search-link")
    fireEvent.click(link)

    // Wait for the online search results heading to render (ensuring loading is finished)
    expect(await screen.findByText("Kết quả trực tuyến từ Open Food Facts")).toBeInTheDocument()

    // Verify amber warning banner is visible
    expect(screen.getByText(/dữ liệu cộng đồng quốc tế/i)).toBeInTheDocument()

    // Verify source badge is shown (it has "OFF" text)
    const badges = await screen.findAllByText("OFF")
    expect(badges.length).toBeGreaterThan(0)
    expect(badges[0]).toBeInTheDocument()
  })

  it("handles HTTP 429 Rate Limit error gracefully", async () => {
    const onQueryChange = vi.fn()
    const onSelectFood = vi.fn()

    renderWithMemberSession(
      <FoodSearchPanel
        query="rate-limit"
        onQueryChange={onQueryChange}
        onSelectFood={onSelectFood}
      />
    )

    const btn = await screen.findByTestId("online-search-trigger-btn")
    fireEvent.click(btn)

    // Wait for Rate Limit warning state block to be displayed
    expect(await screen.findByText("Đạt giới hạn tần suất (Rate Limit)")).toBeInTheDocument()
    expect(screen.getByText(/Đã đạt giới hạn tra cứu. Hệ thống Open Food Facts giới hạn 10 lần tìm kiếm\/phút/i)).toBeInTheDocument()
    
    // Custom food action is present under the error state
    expect(screen.getByRole("button", { name: /Tự tạo món ăn/i })).toBeInTheDocument()
  })
})

