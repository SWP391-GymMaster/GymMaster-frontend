"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, Search, AlertCircle, X, Keyboard, Volume2 } from "lucide-react"
import { BrowserMultiFormatReader } from "@zxing/library"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { sampleBarcodes } from "@/features/member-nutrition/data/nutrition-fallback-data"
import { cn } from "@/lib/utils"

type BarcodeScannerDialogProps = {
  isOpen: boolean
  onClose: () => void
  onDetected: (barcode: string) => void
}

export function BarcodeScannerDialog({ isOpen, onClose, onDetected }: BarcodeScannerDialogProps) {
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera")
  const [manualBarcode, setManualBarcode] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  // Audio synthesize beep on successful scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext } & typeof globalThis).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.type = "sine"
      osc.frequency.setValueAtTime(800, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.12)
    } catch (e) {
      console.warn("Could not play scan beep:", e)
    }
  }

  // Handle manual input search
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualBarcode.trim()) {
      toast.error("Vui lòng nhập mã vạch.")
      return
    }
    onDetected(manualBarcode.trim())
    setManualBarcode("")
  }

  // Start Camera Scanning
  const startCamera = async () => {
    setCameraError(null)
    setIsScanning(true)
    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader()
      }

      const reader = codeReaderRef.current
      const videoElement = videoRef.current

      if (!videoElement) {
        throw new Error("Không thể liên kết thẻ video.")
      }

      // Try to find rear camera, fall back to default
      const videoDevices = await reader.listVideoInputDevices()
      if (videoDevices.length === 0) {
        throw new Error("Không tìm thấy camera nào trên thiết bị.")
      }

      // Find back/rear camera if available
      const rearCamera = videoDevices.find((device) =>
        device.label.toLowerCase().includes("back") ||
        device.label.toLowerCase().includes("rear") ||
        device.label.toLowerCase().includes("environment")
      )
      const selectedDeviceId = rearCamera ? rearCamera.deviceId : videoDevices[0].deviceId

      await reader.decodeFromVideoDevice(
        selectedDeviceId,
        videoElement,
        (result, err) => {
          if (result) {
            playBeep()
            toast.success(`Đã quét được mã vạch: ${result.getText()}`)
            onDetected(result.getText())
            // Stop scanning on success
            stopCamera()
          }
          if (err && !(err.name === "NotFoundException")) {
            // Log other errors silently, NotFound is normal when barcode is not in frame
            console.debug("Scan frame error:", err)
          }
        }
      )
    } catch (error) {
      console.error("Camera scan failed:", error)
      const message = error instanceof Error ? error.message : "Không thể truy cập camera. Vui lòng cấp quyền hoặc nhập mã vạch bằng tay."
      setCameraError(message)
      setIsScanning(false)
    }
  }

  // Stop Camera Scanning
  const stopCamera = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (e) {
        console.warn("Error stopping reader:", e)
      }
    }
    setIsScanning(false)
  }

  useEffect(() => {
    if (isOpen && scanMode === "camera") {
      // Small timeout to let Dialog content mount before accessing videoRef
      const timer = setTimeout(() => {
        startCamera()
      }, 300)
      return () => {
        clearTimeout(timer)
        stopCamera()
      }
    } else {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, scanMode])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md rounded-3xl p-0 border border-white/20 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <DialogHeader className="border-b border-border p-6 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Volume2 className="size-4" />
              </span>
              Quét mã vạch thực phẩm
            </DialogTitle>
            <DialogDescription className="mt-1">
              Tra cứu thông tin dinh dưỡng tự động qua barcode.
            </DialogDescription>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-1.5 hover:bg-muted text-muted-foreground transition active:scale-95"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-border px-6 py-2 bg-muted/30">
          <button
            type="button"
            onClick={() => setScanMode("camera")}
            className={cn(
              "flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2",
              scanMode === "camera"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Camera className="size-4" />
            Sử dụng Camera
          </button>
          <button
            type="button"
            onClick={() => setScanMode("manual")}
            className={cn(
              "flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2",
              scanMode === "manual"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Keyboard className="size-4" />
            Nhập thủ công
          </button>
        </div>

        <div className="p-6">
          {scanMode === "camera" && (
            <div className="space-y-4">
              {/* Video container */}
              <div className="relative aspect-video w-full rounded-2xl border border-border bg-black overflow-hidden flex items-center justify-center shadow-inner">
                {cameraError ? (
                  <div className="p-5 text-center space-y-3 flex flex-col items-center">
                    <AlertCircle className="size-10 text-destructive animate-pulse" />
                    <p className="text-xs font-semibold text-muted-foreground max-w-[280px]">
                      {cameraError}
                    </p>
                    <Button
                      onClick={() => setScanMode("manual")}
                      variant="outline"
                      className="text-xs h-9 rounded-xl active:scale-[0.98]"
                    >
                      Chuyển sang Nhập bằng tay
                    </Button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    {isScanning && (
                      <>
                        {/* Scanning Box overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative size-36 border-2 border-primary rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                            {/* Scanning laser animation */}
                            <div className="absolute left-0 w-full h-[2px] bg-primary animate-[bounce_2.5s_infinite] shadow-[0_0_8px_#22c55e]" />
                          </div>
                        </div>
                        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm animate-pulse">
                          Đang tìm mã vạch...
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {scanMode === "manual" && (
            <form onSubmit={handleManualSearch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="barcode-input">
                  Nhập mã vạch (EAN-13 / UPC)
                </label>
                <div className="relative flex items-center">
                  <Input
                    id="barcode-input"
                    className="min-h-12 w-full bg-background pl-4 pr-12 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                    placeholder="Gõ mã vạch (ví dụ: 8934563138061)..."
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ""))} // Only digits
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1.5 size-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]"
                  >
                    <Search className="size-4" />
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Quick Demo selection */}
          <div className="mt-5 border-t border-border pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Mã vạch sản phẩm mẫu (Dành cho Demo)
            </h4>
            <div className="grid gap-2">
              {sampleBarcodes.map((item) => (
                <button
                  key={item.barcode}
                  onClick={() => {
                    playBeep()
                    toast.success(`Đã chọn sản phẩm mẫu: ${item.name}`)
                    onDetected(item.barcode)
                  }}
                  type="button"
                  className="flex flex-col text-left p-3 rounded-xl border border-border bg-card/50 hover:bg-primary/5 hover:border-primary/40 transition active:scale-[0.99]"
                >
                  <span className="font-semibold text-xs text-foreground flex justify-between items-center w-full">
                    <span>{item.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{item.barcode}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">{item.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
