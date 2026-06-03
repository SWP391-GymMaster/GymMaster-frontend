import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PackageEditorDialog } from "@/features/billing/components/PackageEditorDialog"
import { useCreatePackage, useUpdatePackage } from "@/features/billing/api/billing.queries"
import { toast } from "sonner"

vi.mock("@/features/billing/api/billing.queries")
vi.mock("sonner")

describe("PackageEditorDialog", () => {
  const mockOnOpenChange = vi.fn()
  const mockCreateMutateAsync = vi.fn()
  const mockUpdateMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCreatePackage).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreatePackage>)

    vi.mocked(useUpdatePackage).mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdatePackage>)
  })

  it("renders trigger and title correctly in create mode", () => {
    render(
      <PackageEditorDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        trigger={<button>Trigger Open</button>}
      />,
    )

    expect(screen.getByText("Thêm gói tập mới")).toBeInTheDocument()
    expect(screen.getByLabelText("Tên gói tập")).toBeInTheDocument()
    expect(screen.getByLabelText("Thời hạn (ngày)")).toBeInTheDocument()
    expect(screen.getByLabelText("Giá tiền (VND)")).toBeInTheDocument()
  })

  it("renders with prepopulated values in edit mode", () => {
    const existingPackage = {
      id: 1,
      name: "Super Pack",
      durationDays: 60,
      price: 1500000,
      status: "active" as const,
    }

    render(
      <PackageEditorDialog
        gymPackage={existingPackage}
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    )

    expect(screen.getByText("Chỉnh sửa gói tập")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Super Pack")).toBeInTheDocument()
    expect(screen.getByDisplayValue("60")).toBeInTheDocument()
    expect(screen.getByDisplayValue("1500000")).toBeInTheDocument()
  })

  it("shows validation error when fields are empty or invalid", async () => {
    render(<PackageEditorDialog open={true} onOpenChange={mockOnOpenChange} />)

    const nameInput = screen.getByLabelText("Tên gói tập")
    const durationInput = screen.getByLabelText("Thời hạn (ngày)")
    const priceInput = screen.getByLabelText("Giá tiền (VND)")
    const submitBtn = screen.getByText("Lưu gói tập")

    // Empty name
    fireEvent.change(nameInput, { target: { value: "" } })
    fireEvent.change(durationInput, { target: { value: "-5" } }) // Negative days
    fireEvent.change(priceInput, { target: { value: "-100" } }) // Negative price
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText("Tên gói tập phải từ 2 ký tự trở lên")).toBeInTheDocument()
      expect(screen.getByText("Thời hạn phải là số ngày dương")).toBeInTheDocument()
      expect(screen.getByText("Giá tiền không được nhỏ hơn 0")).toBeInTheDocument()
    })
  })

  it("submits valid create form successfully", async () => {
    mockCreateMutateAsync.mockResolvedValueOnce({ id: 99 })

    render(<PackageEditorDialog open={true} onOpenChange={mockOnOpenChange} />)

    const nameInput = screen.getByLabelText("Tên gói tập")
    const durationInput = screen.getByLabelText("Thời hạn (ngày)")
    const priceInput = screen.getByLabelText("Giá tiền (VND)")
    const submitBtn = screen.getByText("Lưu gói tập")

    fireEvent.change(nameInput, { target: { value: "Premium 60" } })
    fireEvent.change(durationInput, { target: { value: "60" } })
    fireEvent.change(priceInput, { target: { value: "1200000" } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        name: "Premium 60",
        durationDays: 60,
        price: 1200000,
        status: "active",
      })
      expect(toast.success).toHaveBeenCalledWith("Tạo gói tập mới thành công!")
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it("submits valid edit form successfully", async () => {
    const existingPackage = {
      id: 1,
      name: "Super Pack",
      durationDays: 60,
      price: 1500000,
      status: "active" as const,
    }

    mockUpdateMutateAsync.mockResolvedValueOnce({ id: 1 })

    render(
      <PackageEditorDialog
        gymPackage={existingPackage}
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    )

    const nameInput = screen.getByLabelText("Tên gói tập")
    const submitBtn = screen.getByText("Lưu gói tập")

    fireEvent.change(nameInput, { target: { value: "Super Pack Pro" } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        packageId: 1,
        draft: {
          name: "Super Pack Pro",
          durationDays: 60,
          price: 1500000,
          status: "active",
        },
      })
      expect(toast.success).toHaveBeenCalledWith("Cập nhật gói tập thành công!")
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
