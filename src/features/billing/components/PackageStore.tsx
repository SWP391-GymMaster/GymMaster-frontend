"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  usePackages,
  useCreateRenewalRequest,
  useCurrentMemberProfileId,
} from "@/features/billing/api/billing.queries";
import { getCurrentUser } from "@/features/auth/api/auth.api";
import { useAuthSessionStore } from "@/features/auth/session/auth-session";
import {
  PaymentPendingDialog,
  type PaymentOrder,
} from "@/features/billing/components/PaymentPendingDialog";
import { StateBlock } from "@/components/feedback/StateBlock";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

type PackageStoreProps = {
  // Member dang co goi active/pending -> khoa mua (luat 1 goi active/nguoi).
  hasActiveOrPending?: boolean;
};

/**
 * Catalog gói tập cho member: duyệt + đăng ký. Tái dùng ở trang membership.
 * Tự lo luồng mua (renewal-request -> màn thanh toán) + tự tạo hồ sơ nếu lần đầu.
 */
export function PackageStore({ hasActiveOrPending = false }: PackageStoreProps) {
  const memberId = useCurrentMemberProfileId();
  const packages = usePackages();
  const renewMutation = useCreateRenewalRequest();
  const session = useAuthSessionStore((state) => state.session);
  const setSession = useAuthSessionStore((state) => state.setSession);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Sau khi dang ky goi dau tien, backend tao ho so hoi vien -> refetch /auth/me
  // de memberProfileId cap nhat vao session => mo khoa cac tinh nang ngay.
  async function refreshMemberProfile() {
    if (!session) return;
    try {
      const user = await getCurrentUser(session.accessToken);
      setSession({ ...session, user });
    } catch {
      // Bo qua: gate se mo o lan dang nhap sau.
    }
  }

  function handleBuy(packageId: number) {
    if (!packageId || hasActiveOrPending) return;
    const pkg = packages.data?.find((p) => p.id === packageId);
    renewMutation.mutate(packageId, {
      onSuccess: async (result) => {
        // Mo man thanh toan (placeholder VNPay): ma don + dem nguoc.
        setPaymentOrder({
          code: `GM-${result.id}`,
          amount: pkg?.price ?? 0,
          packageName: pkg?.name ?? "Gói tập",
          membershipId: result.id,
        });
        setPaymentOpen(true);
        if (!memberId) {
          await refreshMemberProfile();
        }
      },
      onError: () => {
        toast.error("Không gửi được yêu cầu. Vui lòng thử lại.");
      },
    });
  }

  const activePackages = (packages.data ?? []).filter(
    (p) => p.status === "active",
  );

  return (
    <div className="space-y-4">
      {hasActiveOrPending ? (
        <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Bạn đang có gói đang hoạt động nên chưa thể mua thêm. Khi gói hết hạn,
          bạn có thể đăng ký gói mới ngay tại đây.
        </p>
      ) : null}

      {packages.isLoading ? (
        <StateBlock tone="loading" title="Đang tải gói tập..." />
      ) : packages.isError ? (
        <StateBlock
          tone="error"
          title="Lỗi tải gói tập"
          description="Không tải được danh sách gói. Vui lòng thử lại."
        />
      ) : activePackages.length === 0 ? (
        <StateBlock
          tone="empty"
          title="Chưa có gói tập"
          description="Hiện chưa có gói nào để đăng ký. Vui lòng quay lại sau."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activePackages.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-sm"
              data-testid={`store-package-${p.id}`}
            >
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {p.name}
              </h3>
              {p.supportsPT ? (
                <span className="mt-2 inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Có PT
                </span>
              ) : null}
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {formatPrice(p.price)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / {p.durationDays} ngày
                </span>
              </p>
              <button
                type="button"
                disabled={hasActiveOrPending || renewMutation.isPending}
                onClick={() => handleBuy(p.id)}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                data-testid={`buy-package-${p.id}`}
              >
                {renewMutation.isPending
                  ? "Đang gửi..."
                  : hasActiveOrPending
                    ? "Đang có gói"
                    : "Đăng ký gói này"}
              </button>
            </div>
          ))}
        </div>
      )}

      <PaymentPendingDialog
        open={paymentOpen}
        order={paymentOrder}
        onClose={() => setPaymentOpen(false)}
        onRetry={() => setPaymentOpen(false)}
      />
    </div>
  );
}
