"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

import { getVnpayReturnStatus } from "@/features/billing/api/vnpay.api";
import { billingKeys } from "@/features/billing/api/billing.queries";
import { member360Keys } from "@/features/member-360/api/member-360.queries";

export default function VnPayReturnPage() {
  const [status, setStatus] = useState<"loading" | "success" | "failure" | "error">("loading");
  const queryClient = useQueryClient();

  useEffect(() => {
    // Goi BE /return voi nguyen query VNPay redirect ve. Query rong -> BE tu bao loi -> catch.
    getVnpayReturnStatus(window.location.search)
      .then((result) => {
        const paid = result.status === "Paid";
        setStatus(paid ? "success" : "failure");
        if (paid) {
          // Goi vua kich hoat -> lam moi billing + member-360 de trang Goi tap (va lich su) hien dung trang thai.
          void queryClient.invalidateQueries({ queryKey: billingKeys.all });
          void queryClient.invalidateQueries({ queryKey: member360Keys.all });
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [queryClient]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-[1.5rem] border border-border/70 bg-card p-8 shadow-xl">
        {status === "loading" ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              Đang xác nhận thanh toán...
            </p>
          </div>
        ) : status === "success" ? (
          <div className="text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-8" />
            </span>
            <h1 className="mt-6 text-2xl font-semibold text-foreground">
              Thanh toán thành công!
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Gói tập đã được kích hoạt.
            </p>
          </div>
        ) : status === "failure" ? (
          <div className="text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <AlertTriangle className="size-8" />
            </span>
            <h1 className="mt-6 text-2xl font-semibold text-foreground">
              Thanh toán chưa hoàn tất hoặc thất bại.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Vui lòng kiểm tra lại giao dịch hoặc thử lại sau.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-8" />
            </span>
            <h1 className="mt-6 text-2xl font-semibold text-foreground">
              Không xác minh được giao dịch.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Có lỗi khi xác nhận thanh toán VNPay.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/member/membership"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
          >
            <ArrowLeft className="size-4" />
            Về trang Gói tập
          </Link>
        </div>
      </div>
    </div>
  );
}
