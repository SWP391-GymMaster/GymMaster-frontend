"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useMember360Data } from "@/features/member-360/api/member-360.queries";
import {
  useMemberPayments,
  useCurrentMemberProfileId,
  useCancelMembership,
} from "@/features/billing/api/billing.queries";
import { PackageStore } from "@/features/billing/components/PackageStore";
import { PaymentPendingDialog } from "@/features/billing/components/PaymentPendingDialog";
import { StatusPill } from "@/components/data/StatusPill";
import { StateBlock } from "@/components/feedback/StateBlock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, User, Activity } from "lucide-react";

const PAYMENT_PAGE_SIZE = 8;

export function MemberMembershipDetails() {
  const memberId = useCurrentMemberProfileId();
  const {
    data: member360,
    isLoading: is360Loading,
    error: error360,
  } = useMember360Data(memberId);
  const {
    data: payments,
    isLoading: isPaymentsLoading,
    error: errorPayments,
  } = useMemberPayments(memberId);

  const cancelMutation = useCancelMembership();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paymentFromDate, setPaymentFromDate] = useState("");
  const [paymentToDate, setPaymentToDate] = useState("");
  const [paymentPage, setPaymentPage] = useState(1);

  const isLoading = is360Loading || isPaymentsLoading;
  const error = error360 || errorPayments;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusLabel = (status: "paid" | "pending" | "refunded") => {
    if (status === "paid") return "Đã thanh toán";
    if (status === "pending") return "Đang chờ";
    return "Đã hoàn tiền";
  };

  const getMembershipStatusLabel = (
    status?: "pending_payment" | "active" | "expired" | "cancelled",
  ) => {
    switch (status) {
      case "active":
        return "Đang hiệu lực";
      case "pending_payment":
        return "Chờ thanh toán";
      case "expired":
        return "Hết hạn";
      case "cancelled":
        return "Đã hủy";
      default:
        return "—";
    }
  };

  const filteredPayments = useMemo(() => {
    return (payments ?? []).filter((payment) => {
      const paidDate = toDateInputValue(payment.paymentDate);
      const matchesFrom = !paymentFromDate || paidDate >= paymentFromDate;
      const matchesTo = !paymentToDate || paidDate <= paymentToDate;

      return matchesFrom && matchesTo;
    });
  }, [paymentFromDate, paymentToDate, payments]);

  const paymentTotalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAYMENT_PAGE_SIZE),
  );
  const safePaymentPage = Math.min(paymentPage, paymentTotalPages);
  const paymentStartIndex = (safePaymentPage - 1) * PAYMENT_PAGE_SIZE;
  const pagedPayments = filteredPayments.slice(
    paymentStartIndex,
    paymentStartIndex + PAYMENT_PAGE_SIZE,
  );
  const hasPaymentDateFilter = Boolean(paymentFromDate || paymentToDate);
  const firstVisiblePayment =
    filteredPayments.length === 0 ? 0 : paymentStartIndex + 1;
  const lastVisiblePayment = Math.min(
    paymentStartIndex + pagedPayments.length,
    filteredPayments.length,
  );

  function clearPaymentDateFilter() {
    setPaymentFromDate("");
    setPaymentToDate("");
    setPaymentPage(1);
  }

  if (isLoading) {
    return <StateBlock tone="loading" title="Đang tải thông tin gói tập..." />;
  }

  if (error) {
    return (
      <StateBlock
        tone="error"
        title="Lỗi tải thông tin gói tập"
        description="Không thể tải dữ liệu thẻ thành viên và hóa đơn thanh toán của bạn."
      />
    );
  }

  const membership = member360?.currentMembership;
  const pt = member360?.assignedPT;
  const checkIns = member360?.recentCheckIns ?? [];

  // Backend chan 1 hoi vien co 2 goi active cung luc (ALREADY_HAS_ACTIVE) -> khoa mua.
  const hasActiveOrPending =
    membership?.status === "active" ||
    membership?.status === "pending_payment";

  function handleCancel() {
    if (!membership) return;
    cancelMutation.mutate(membership.id, {
      onSuccess: () => {
        setCancelOpen(false);
        toast.success("Đã hủy gói tập.");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : "Hủy không thành công. Vui lòng thử lại.",
        );
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* ① Gói hiện tại + PT + Check-in */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Gói tập hiện tại */}
        <div className="flex flex-col justify-between rounded-[1.5rem] border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur">
          <div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm font-semibold uppercase tracking-[0.08em]">
              <CreditCard className="size-4 text-primary" />
              <span>Gói tập hiện tại</span>
            </div>
            <div className="mt-4">
              {membership ? (
                <>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {membership.packageName}
                  </h3>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bắt đầu:</span>
                      <span className="font-semibold text-foreground">
                        {formatDate(membership.startDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kết thúc:</span>
                      <span className="font-semibold text-foreground">
                        {formatDate(membership.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Trạng thái thẻ:
                      </span>
                      <StatusPill status={membership.status} />
                    </div>
                  </div>
                  {membership.status === "pending_payment" ? (
                    <>
                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                        ⏳ Đơn đang chờ thanh toán. Hoàn tất thanh toán online
                        hoặc ra quầy lễ tân để kích hoạt gói.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPayOpen(true)}
                        className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
                        data-testid="continue-payment-button"
                      >
                        Tiếp tục thanh toán
                      </button>
                    </>
                  ) : null}
                  {membership.status === "active" ? (
                    <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                      ✅ Gói còn hiệu lực đến {formatDate(membership.endDate)}.
                    </p>
                  ) : null}
                  {membership.status === "active" ||
                  membership.status === "pending_payment" ? (
                    <button
                      type="button"
                      onClick={() => setCancelOpen(true)}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-destructive/40 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/10 active:scale-[0.98]"
                      data-testid="cancel-membership-button"
                    >
                      {membership.status === "pending_payment"
                        ? "Hủy đơn"
                        : "Hủy gói"}
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Bạn chưa có gói tập nào. Chọn một gói ở mục “Mua / Đổi gói” bên
                  dưới để bắt đầu.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Huấn luyện viên cá nhân */}
        <div className="flex flex-col justify-between rounded-[1.5rem] border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 text-muted-foreground text-sm font-semibold uppercase tracking-[0.08em]">
              <User className="size-4 text-primary" />
              <span>Huấn luyện viên cá nhân (PT)</span>
            </div>
            <div className="mt-4 flex-1 flex flex-col justify-between">
              {pt ? (
                <>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {pt.fullName}
                  </h3>
                  <p className="text-sm text-primary font-semibold mt-1">
                    {pt.specialty}
                  </p>
                  <div className="mt-auto space-y-2 text-sm border-t border-border/50 pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Ngày phân công:
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatDate(pt.assignedAt)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Bạn hiện tại chưa được chỉ định huấn luyện viên cá nhân.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Check-in gần đây */}
        <div className="flex flex-col justify-between rounded-[1.5rem] border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 text-muted-foreground text-sm font-semibold uppercase tracking-[0.08em]">
              <Activity className="size-4 text-primary" />
              <span>Check-in gần đây</span>
            </div>
            <div className="mt-4 flex-1 flex flex-col justify-between">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Tổng check-in: {checkIns.length} lần
              </h3>
              <div className="mt-4 space-y-2 text-sm border-t border-border/50 pt-3">
                {checkIns.length > 0 ? (
                  checkIns.slice(0, 2).map((ci) => (
                    <div className="flex justify-between text-sm" key={ci.id}>
                      <span className="text-muted-foreground">
                        Đã check-in vào:
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatDateTime(ci.checkInAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Chưa ghi nhận check-in.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ② Mua / Đổi gói — LUÔN hiện (kiểu app thật) */}
      <section
        className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm"
        data-testid="member-package-store"
      >
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          Mua / Đổi gói tập
        </h3>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Chọn gói phù hợp để đăng ký. Thanh toán online hoặc tại quầy lễ tân.
        </p>
        <PackageStore hasActiveOrPending={hasActiveOrPending} />
      </section>

      {/* ③ Lịch sử hóa đơn */}
      <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">
          Lịch sử hóa đơn thanh toán
        </h3>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border/70 bg-background/60 p-3">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Từ ngày
              <input
                type="date"
                value={paymentFromDate}
                max={paymentToDate || undefined}
                onChange={(event) => {
                  setPaymentFromDate(event.target.value);
                  setPaymentPage(1);
                }}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Đến ngày
              <input
                type="date"
                value={paymentToDate}
                min={paymentFromDate || undefined}
                onChange={(event) => {
                  setPaymentToDate(event.target.value);
                  setPaymentPage(1);
                }}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            {hasPaymentDateFilter ? (
              <button
                type="button"
                onClick={clearPaymentDateFilter}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
              >
                Xóa lọc
              </button>
            ) : null}
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            {filteredPayments.length === 0
              ? "Không có hóa đơn phù hợp"
              : `Hiển thị ${firstVisiblePayment}-${lastVisiblePayment} / ${filteredPayments.length} hóa đơn`}
          </p>
        </div>
        {!payments || payments.length === 0 ? (
          <StateBlock
            tone="empty"
            title="Không có hóa đơn"
            description="Bạn chưa thực hiện giao dịch thanh toán nào."
          />
        ) : filteredPayments.length === 0 ? (
          <StateBlock
            tone="empty"
            title="Không có hóa đơn phù hợp"
            description="Thử đổi khoảng ngày hoặc xóa bộ lọc để xem lại toàn bộ lịch sử."
          />
        ) : (
          <>
          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-sm"
              data-testid="member-payments-table"
            >
              <thead>
                <tr className="border-b border-border pb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="py-3 px-4">Mã giao dịch</th>
                  <th className="py-3 px-4">Gói tập</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Phương thức</th>
                  <th className="py-3 px-4">Ngày thanh toán</th>
                  <th className="py-3 px-4">Thanh toán</th>
                  <th className="py-3 px-4">Trạng thái gói</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pagedPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-muted/30"
                    data-testid={`payment-row-${payment.id}`}
                  >
                    <td className="py-4 px-4 font-mono text-zinc-600">
                      GD-{payment.id}
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground">
                      {payment.packageName}
                    </td>
                    <td className="py-4 px-4 font-bold text-foreground">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="py-4 px-4 text-zinc-600">
                      {payment.paymentMethod}
                    </td>
                    <td className="py-4 px-4 text-zinc-500">
                      {formatDateTime(payment.paymentDate)}
                    </td>
                    <td className="py-4 px-4">
                      <StatusPill
                        status={payment.status}
                        label={getStatusLabel(payment.status)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      {payment.membershipStatus ? (
                        <StatusPill
                          status={payment.membershipStatus}
                          label={getMembershipStatusLabel(
                            payment.membershipStatus,
                          )}
                        />
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
            <p className="text-sm font-semibold text-muted-foreground">
              Trang {safePaymentPage} / {paymentTotalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePaymentPage <= 1}
                onClick={() => setPaymentPage((page) => Math.max(1, page - 1))}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={safePaymentPage >= paymentTotalPages}
                onClick={() =>
                  setPaymentPage((page) => Math.min(paymentTotalPages, page + 1))
                }
                className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>
              {membership?.status === "pending_payment"
                ? "Hủy đơn chờ thanh toán?"
                : "Hủy gói đang hoạt động?"}
            </DialogTitle>
            <DialogDescription>
              {membership?.status === "pending_payment"
                ? "Đơn chờ thanh toán này sẽ bị hủy. Bạn có thể đăng ký lại bất cứ lúc nào."
                : "⚠️ Bạn sẽ MẤT số ngày còn lại của gói và KHÔNG được hoàn tiền. Hành động này không thể hoàn tác."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCancelOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
            >
              Không
            </button>
            <button
              type="button"
              disabled={cancelMutation.isPending}
              onClick={handleCancel}
              className="inline-flex h-10 items-center justify-center rounded-full bg-destructive px-5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              data-testid="confirm-cancel-membership"
            >
              {cancelMutation.isPending ? "Đang hủy..." : "Xác nhận hủy"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentPendingDialog
        open={payOpen}
        order={
          membership
            ? {
                code: `HD-${membership.id}`,
                amount: 0,
                packageName: membership.packageName,
                membershipId: membership.id,
              }
            : null
        }
        onClose={() => setPayOpen(false)}
        onRetry={() => setPayOpen(false)}
      />
    </div>
  );
}

function toDateInputValue(dateStr: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
