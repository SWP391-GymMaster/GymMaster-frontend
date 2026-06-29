"use client"

import { useState } from "react"
import { CreditCard, Store } from "lucide-react"

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

const primaryButton =
  "inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
const outlineButton =
  "inline-flex h-11 w-full items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"

export function PaymentPendingDialog({
  open,
  order,
  onClose,
}: PaymentPendingDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [counterMode, setCounterMode] = useState(false)
  const token = useAuthSessionStore((s) => s.session?.accessToken)

  function close() {
    setCounterMode(false)
    onClose()
  }

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

  function handleCounter() {
    setCounterMode(true)
    toast.success("Đã tạo đơn. Ra quầy lễ tân để thanh toán.")
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md rounded-[1.5rem]">
        {counterMode ? (
          <>
            <DialogHeader>
              <DialogTitle>Đã tạo đơn chờ thanh toán</DialogTitle>
              <DialogDescription>
                Ra quầy lễ tân để hoàn tất.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Store className="size-7" />
              </span>
              <div className="w-full space-y-2 rounded-2xl border border-border bg-muted/30 p-4 text-left text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mã đơn</span>
                  <span className="font-mono font-semibold text-foreground">
                    {order?.code ?? "—"}
                  </span>
                </div>
                {order && order.amount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Số tiền</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(order.amount)}
                    </span>
                  </div>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                Đưa mã đơn cho lễ tân và trả tiền mặt. Gói kích hoạt ngay sau khi
                lễ tân xác nhận. Bạn vẫn có thể thanh toán online bất cứ lúc nào.
              </p>
              <button type="button" onClick={close} className={primaryButton}>
                Đã hiểu
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Thanh toán gói tập</DialogTitle>
              <DialogDescription>
                Chọn cách thanh toán cho đơn của bạn.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    Gói {order?.packageName ?? "tập"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order && order.amount > 0
                      ? formatPrice(order.amount)
                      : "Số tiền cập nhật khi xác nhận"}
                    {order?.code ? ` · Mã ${order.code}` : ""}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleVnpayPay}
                  disabled={isLoading || !order}
                  className={primaryButton}
                >
                  {isLoading ? "Đang chuyển tới VNPay..." : "Thanh toán qua VNPay"}
                </button>
                <button
                  type="button"
                  onClick={handleCounter}
                  disabled={!order}
                  className={outlineButton}
                >
                  Trả tiền mặt tại quầy
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
