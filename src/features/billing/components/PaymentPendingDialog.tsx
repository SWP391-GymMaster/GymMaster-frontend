"use client"

import { useEffect, useState } from "react"
import { Clock, QrCode, CheckCircle2, XCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Placeholder cho luong thanh toan (se thay bang VNPay sau).
// Hien ma don + dem nguoc; het gio -> don het han, dat lai.
const PAYMENT_WINDOW_SECONDS = 10 * 60 // 10 phut

export type PaymentOrder = {
  code: string
  amount: number
  packageName: string
}

type PaymentPendingDialogProps = {
  open: boolean
  order: PaymentOrder | null
  onClose: () => void
  onRetry: () => void
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export function PaymentPendingDialog({
  open,
  order,
  onClose,
  onRetry,
}: PaymentPendingDialogProps) {
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS)

  // Reset dong ho moi lan mo dialog.
  useEffect(() => {
    if (open) {
      setSecondsLeft(PAYMENT_WINDOW_SECONDS)
    }
  }, [open])

  // Dem nguoc.
  useEffect(() => {
    if (!open || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [open, secondsLeft])

  const expired = secondsLeft <= 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-[1.5rem]">
        <DialogHeader>
          <DialogTitle>Thanh toán gói tập</DialogTitle>
          <DialogDescription>
            {order
              ? `Gói ${order.packageName} — ${formatPrice(order.amount)}`
              : "Đơn đăng ký gói tập"}
          </DialogDescription>
        </DialogHeader>

        {expired ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="size-7" />
            </span>
            <p className="mt-4 text-base font-semibold text-foreground">
              Hết hạn thanh toán
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mã thanh toán đã hết hiệu lực. Vui lòng đặt lại đơn mới.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
            >
              Đặt lại
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2 text-center">
            {/* QR placeholder (se thay bang QR VNPay that sau) */}
            <div className="flex size-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground">
              <QrCode className="size-16" />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Mã thanh toán
            </p>
            <p className="font-mono text-lg font-bold tracking-wider text-foreground">
              {order?.code ?? "—"}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
              <Clock className="size-4" />
              Còn lại {formatCountdown(secondsLeft)}
            </div>

            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              Quét mã / chuyển khoản trong thời gian trên để hoàn tất.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              (Demo — sẽ tích hợp cổng thanh toán VNPay sau. Lễ tân có thể xác
              nhận thanh toán thủ công.)
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
            >
              Đóng
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
