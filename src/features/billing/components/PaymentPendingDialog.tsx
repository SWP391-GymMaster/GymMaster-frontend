"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { createVnpayUrl } from "@/features/billing/api/vnpay.api"
import { toast } from "sonner"

export type PaymentOrder = {
  code: string
  amount: number
  packageName: string
  membershipId: number
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

export function PaymentPendingDialog({
  open,
  order,
  onClose,
}: PaymentPendingDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const token = useAuthSessionStore((s) => s.session?.accessToken)

  async function handleVnpayPay() {
    if (!order || !token) {
      toast.error("Không thể thanh toán. Vui lòng đăng nhập lại.")
      return
    }

    setIsLoading(true)
    try {
      const result = await createVnpayUrl(token, order.membershipId)
      window.location.href = result.payUrl
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Không thể tạo liên kết thanh toán VNPay."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-[1.5rem]">
        <DialogHeader>
          <DialogTitle>Thanh toán gói tập</DialogTitle>
          <DialogDescription>
            {order
              ? `Gói ${order.packageName} - ${formatPrice(order.amount)}`
              : "Đơn đăng ký gói tập"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-7" />
          </span>
          <p className="mt-4 text-base font-semibold text-foreground">
            {order
              ? `Gói ${order.packageName} - ${formatPrice(order.amount)}`
              : "Đơn thanh toán gói tập"}
          </p>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={handleVnpayPay}
              disabled={isLoading || !order}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Đang chuyển tới VNPay..." : "Thanh toán qua VNPay"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
            >
              Trả tại quầy
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Bạn có thể ra quầy trả tiền mặt - gói sẽ kích hoạt sau khi lễ tân xác nhận.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
