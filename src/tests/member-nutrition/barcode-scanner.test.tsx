import { fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { BarcodeScannerDialog } from "@/features/member-nutrition/components/BarcodeScannerDialog"
import { AppProviders } from "@/app/providers"
import { render } from "@testing-library/react"
import { toast } from "sonner"

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

// Mock ZXing reader library
const mockDecodeFromVideoDevice = vi.fn()
const mockListVideoInputDevices = vi.fn().mockResolvedValue([
  { deviceId: "device-1", label: "Front Camera" },
  { deviceId: "device-2", label: "Rear Camera environment" },
])
const mockReset = vi.fn()

vi.mock("@zxing/library", () => {
  return {
    BrowserMultiFormatReader: vi.fn().mockImplementation(() => {
      return {
        listVideoInputDevices: mockListVideoInputDevices,
        decodeFromVideoDevice: mockDecodeFromVideoDevice,
        reset: mockReset,
      }
    }),
  }
})

beforeAll(() => {
  // Mock AudioContext for synthesize beep
  const mockAudioContext = {
    createOscillator: vi.fn().mockReturnValue({
      connect: vi.fn(),
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
      },
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
      },
    }),
    destination: {},
    currentTime: 0,
  }

  vi.stubGlobal("AudioContext", vi.fn().mockImplementation(() => mockAudioContext))
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("BarcodeScannerDialog", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onDetected: vi.fn(),
  }

  const renderComponent = (props = {}) => {
    return render(
      <AppProviders>
        <BarcodeScannerDialog {...defaultProps} {...props} />
      </AppProviders>
    )
  }

  it("renders correctly with default camera mode", async () => {
    renderComponent()

    expect(screen.getByText("Quét mã vạch thực phẩm")).toBeInTheDocument()
    expect(screen.getByText("Sử dụng Camera")).toBeInTheDocument()
    expect(screen.getByText("Nhập thủ công")).toBeInTheDocument()

    // Camera mode starts decode process
    await waitFor(() => {
      expect(mockListVideoInputDevices).toHaveBeenCalled()
      expect(mockDecodeFromVideoDevice).toHaveBeenCalled()
    })
  })

  it("switches to manual mode and allows barcode typing and submit", async () => {
    renderComponent()

    // Click 'Nhập thủ công'
    fireEvent.click(screen.getByText("Nhập thủ công"))

    // Find input and type barcode
    const input = screen.getByLabelText("Nhập mã vạch (EAN-13 / UPC)")
    fireEvent.change(input, { target: { value: "8934563138061" } })

    // Click submit search button
    const submitBtn = screen.getByRole("button", { name: "" }) // Search icon button has no label
    fireEvent.click(submitBtn)

    expect(defaultProps.onDetected).toHaveBeenCalledWith("8934563138061")
  })

  it("shows error toast if manual barcode is empty on submit", async () => {
    renderComponent()

    // Click 'Nhập thủ công'
    fireEvent.click(screen.getByText("Nhập thủ công"))

    // Submit without typing
    const submitBtn = screen.getByRole("button", { name: "" })
    fireEvent.click(submitBtn)

    expect(toast.error).toHaveBeenCalledWith("Vui lòng nhập mã vạch.")
    expect(defaultProps.onDetected).not.toHaveBeenCalled()
  })

  it("triggers onDetected when clicking a sample barcode item", async () => {
    renderComponent()

    // Find the TH True Milk sample card button
    const sampleBtn = screen.getByText("Sữa TH True Milk ít đường 180ml")
    fireEvent.click(sampleBtn.closest("button")!)

    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Đã chọn sản phẩm mẫu"))
    expect(defaultProps.onDetected).toHaveBeenCalledWith("8936079015707")
  })

  it("handles camera permission errors and lets user switch to manual mode", async () => {
    mockListVideoInputDevices.mockRejectedValueOnce(new Error("Camera Permission Denied"))

    renderComponent()

    // Check error message is displayed
    expect(await screen.findByText(/Camera Permission Denied/i)).toBeInTheDocument()

    // Check if there is a button to switch to manual
    const switchBtn = screen.getByText("Chuyển sang Nhập bằng tay")
    fireEvent.click(switchBtn)

    // Verify it switched
    expect(screen.getByLabelText("Nhập mã vạch (EAN-13 / UPC)")).toBeInTheDocument()
  })

  it("calls reset/stop camera when component is closed or unmounted", async () => {
    const { unmount } = renderComponent()

    // Start scanning calls decode
    await waitFor(() => {
      expect(mockDecodeFromVideoDevice).toHaveBeenCalled()
    })

    unmount()

    expect(mockReset).toHaveBeenCalled()
  })
})
