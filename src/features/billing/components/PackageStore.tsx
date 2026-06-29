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
import { formatVnDate, vnTodayIso } from "@/lib/date/vn-time";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return formatVnDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type StoreMembership = {
  status: "pending_payment" | "active" | "expired" | "cancelled";
  endDate: string;
  supportsPT?: boolean;
};

type PendingOrderInfo = {
  packageName: string;
};

type PackageStoreProps = {
  currentMembership?: StoreMembership | null;
  pendingOrder?: PendingOrderInfo | null;
};

export function PackageStore({
  currentMembership = null,
  pendingOrder = null,
}: PackageStoreProps) {
  const memberId = useCurrentMemberProfileId();
  const packages = usePackages();
  const renewMutation = useCreateRenewalRequest();
  const session = useAuthSessionStore((state) => state.session);
  const setSession = useAuthSessionStore((state) => state.setSession);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Single-slot: chỉ giữ 1 đơn chờ tại một thời điểm. Đơn chờ có thể là gói hiện
  // tại đang chờ, HOẶC đơn gia hạn tách riêng khi đang có gói Active. Cả hai đều
  // phải khóa việc tạo đơn mới cho tới khi member thanh toán/hủy đơn đang chờ.
  const hasPendingMembership =
    currentMembership?.status === "pending_payment" || Boolean(pendingOrder);
  const hasActiveMembership =
    currentMembership?.status === "active" &&
    currentMembership.endDate >= vnTodayIso();

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
    if (!packageId || hasPendingMembership) return;
    const requestedPackage = packages.data?.find((p) => p.id === packageId);

    renewMutation.mutate(packageId, {
      onSuccess: async (result) => {
        const orderPackage =
          packages.data?.find((p) => p.id === result.packageId) ??
          requestedPackage;

        setPaymentOrder({
          code: `GM-${result.id}`,
          amount: orderPackage?.price ?? 0,
          packageName: orderPackage?.name ?? result.packageName ?? "Gói tập",
          membershipId: result.id,
        });
        setPaymentOpen(true);
        if (!memberId) {
          await refreshMemberProfile();
        }
      },
      onError: (err) => {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : "Không gửi được yêu cầu. Vui lòng thử lại.",
        );
      },
    });
  }

  const activePackages = (packages.data ?? []).filter(
    (p) =>
      p.status === "active" &&
      (!hasActiveMembership ||
        p.supportsPT === (currentMembership?.supportsPT ?? false)),
  );

  return (
    <div className="space-y-4">
      {hasPendingMembership ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">
            ⏳ Bạn đang có 1 đơn chờ thanh toán
            {pendingOrder?.packageName
              ? `: gói ${pendingOrder.packageName}`
              : ""}
            .
          </p>
          <p className="mt-1 text-amber-700">
            Mỗi lúc chỉ giữ được 1 đơn chờ. Hãy hoàn tất thanh toán hoặc hủy đơn
            đó ở phía trên, rồi mới chọn gói khác.
          </p>
        </div>
      ) : hasActiveMembership ? (
        <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-foreground">
          Bạn có thể gia hạn sớm. Danh sách bên dưới chỉ hiển thị gói cùng loại
          PT với gói hiện tại.
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
          title="Chưa có gói phù hợp"
          description="Hiện chưa có gói đang bán phù hợp với trạng thái gói hiện tại."
        />
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activePackages.map((p) => {
            const currentEndDate = currentMembership?.endDate;
            const newEndDate =
              hasActiveMembership && currentEndDate
                ? addDays(currentEndDate, p.durationDays)
                : null;

            return (
              <div
                key={p.id}
                className="flex h-full min-h-[228px] flex-col rounded-[1.5rem] border border-border/80 bg-[var(--surface-panel)] p-6 shadow-[var(--shadow-soft)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-panel)]"
                data-testid={`store-package-${p.id}`}
              >
                <div className="min-h-[3.75rem]">
                <h3 className="min-h-7 text-lg font-bold tracking-tight text-foreground">
                  {p.name}
                </h3>
                {p.supportsPT ? (
                  <span className="mt-2 inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
                    Có PT
                  </span>
                ) : null}
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                  {formatPrice(p.price)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    / {p.durationDays} ngày
                  </span>
                </p>
                {newEndDate && currentEndDate ? (
                  <p className="mt-4 rounded-2xl border border-border/70 bg-muted/45 px-3 py-2 text-xs font-semibold leading-5 text-muted-foreground">
                    Hạn mới: {formatDate(currentEndDate)} +{" "}
                    {p.durationDays} ngày = {formatDate(newEndDate)}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={hasPendingMembership || renewMutation.isPending}
                  onClick={() => handleBuy(p.id)}
                  className="mt-auto inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_26px_color-mix(in_oklch,var(--primary)_26%,transparent)] transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid={`buy-package-${p.id}`}
                >
                  {renewMutation.isPending
                    ? "Đang gửi..."
                    : hasPendingMembership
                      ? "Đang chờ thanh toán"
                      : hasActiveMembership
                        ? "Gia hạn gói này"
                        : "Đăng ký gói này"}
                </button>
              </div>
            );
          })}
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
