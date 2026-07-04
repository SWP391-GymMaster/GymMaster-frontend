"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useMember360Data } from "@/features/member-360/api/member-360.queries";
import {
  useMemberPayments,
  useCurrentMemberProfileId,
  useCancelMembership,
  usePackages,
} from "@/features/billing/api/billing.queries";
import { PackageStore } from "@/features/billing/components/PackageStore";
import { formatVnDate, vnDateIso } from "@/lib/date/vn-time";
import {
  PaymentPendingDialog,
  type PaymentOrder,
} from "@/features/billing/components/PaymentPendingDialog";
import { StatusPill } from "@/components/data/StatusPill";
import { StateBlock } from "@/components/feedback/StateBlock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, CreditCard, Calendar } from "lucide-react";
import { gymMasterAssets } from "@/lib/gymmaster-assets";

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
  const packages = usePackages();

  const cancelMutation = useCancelMembership();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
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
    return formatVnDate(dateStr, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) =>
    formatVnDate(ensureUtcIso(dateStr), {
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
  const currentPackage = packages.data?.find(
    (item) => item.id === membership?.packageId,
  );
  const membershipCanPay = membership?.status === "pending_payment";
  const pendingOrders = (member360?.membershipHistory ?? []).filter(
    (item) => item.status === "pending_payment" && item.id !== membership?.id,
  );
  // Single-slot: chỉ giữ 1 đơn chờ tại một thời điểm. Đơn chờ hiện có = gói hiện
  // tại đang chờ, hoặc đơn gia hạn tách riêng (khi đang có gói Active).
  const pendingOrder =
    membership?.status === "pending_payment"
      ? membership
      : (pendingOrders[0] ?? null);

  function buildPaymentOrder(
    target: NonNullable<typeof membership>,
    amount = 0,
  ): PaymentOrder {
    return {
      code: `HD-${target.id}`,
      amount,
      packageName: target.packageName,
      membershipId: target.id,
    };
  }

  function handleContinuePayment() {
    if (!membership || !membershipCanPay) return;
    setPaymentOrder(buildPaymentOrder(membership, currentPackage?.price ?? 0));
    setPayOpen(true);
  }

  function handlePayOrder(order: NonNullable<typeof membership>) {
    const pkg = packages.data?.find((item) => item.id === order.packageId);
    setPaymentOrder(buildPaymentOrder(order, pkg?.price ?? 0));
    setPayOpen(true);
  }

  function handleCancelOrder(orderId: number) {
    cancelMutation.mutate(orderId, {
      onSuccess: () => toast.success("Đã hủy đơn."),
      onError: (err) =>
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : "Hủy không thành công. Vui lòng thử lại.",
        ),
    });
  }

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
      {/* ① Gói tập hiện tại */}
      <div className="grid gap-6">
        {/* Gói tập hiện tại */}
        <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          style={{
            backgroundImage: `url("${gymMasterAssets.backgrounds.ptCoachHub}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}>
          {/* Lớp phủ gradient tối cao cấp làm nổi bật văn bản và tạo chiều sâu */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/95 via-zinc-900/85 to-zinc-950/90 backdrop-blur-[2px] transition-all duration-300 group-hover:from-zinc-950/90 group-hover:via-zinc-900/80" />
          
          <div className="relative z-10 flex flex-col justify-between p-6 text-white min-h-[200px]">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-[0.08em]">
                  <CreditCard className="size-4 text-primary" />
                  <span>Gói tập hiện tại</span>
                </div>
                {membership && (
                  <StatusPill status={membership.status} />
                )}
              </div>
              <div className="mt-4">
                {membership ? (
                  <>
                    <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                      {membership.packageName}
                    </h3>
                    
                    {/* Thông tin thời gian dạng inline tag gọn gàng */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
                        <Calendar className="size-3.5 text-zinc-400" />
                        <span className="text-zinc-400">Bắt đầu:</span>
                        <span className="font-semibold text-zinc-100">{formatDate(membership.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
                        <Calendar className="size-3.5 text-zinc-400" />
                        <span className="text-zinc-400">Kết thúc:</span>
                        <span className="font-semibold text-zinc-100">{formatDate(membership.endDate)}</span>
                      </div>
                    </div>

                    {/* Footer: Thông báo trạng thái hiệu lực & Nút hành động */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Trạng thái / Cảnh báo */}
                      <div className="flex-1">
                        {membershipCanPay ? (
                          <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-200">
                            ⏳ Đơn chờ thanh toán. Vui lòng hoàn tất sớm.
                          </div>
                        ) : null}
                        {membership.status === "active" ? (
                          <div className="inline-flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary">
                            ✅ Còn hiệu lực đến {formatDate(membership.endDate)}
                          </div>
                        ) : null}
                      </div>

                      {/* Các nút bấm */}
                      <div className="flex items-center gap-3 shrink-0 max-sm:w-full sm:ml-auto">
                        {membershipCanPay ? (
                          <button
                            type="button"
                            onClick={handleContinuePayment}
                            className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] max-sm:w-full"
                            data-testid="continue-payment-button"
                          >
                            Tiếp tục thanh toán
                          </button>
                        ) : null}
                        {membership.status === "active" ||
                        membership.status === "pending_payment" ? (
                          <button
                            type="button"
                            onClick={() => setCancelOpen(true)}
                            className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 hover:border-red-500/30 px-4 text-xs font-semibold text-zinc-400 hover:text-red-400 transition hover:bg-red-500/10 active:scale-[0.98] max-sm:w-full"
                            data-testid="cancel-membership-button"
                          >
                            {membership.status === "pending_payment"
                              ? "Hủy đơn"
                              : "Hủy gói"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                    Bạn chưa có gói tập nào. Chọn một gói ở mục “Mua / Đổi gói” bên
                    dưới để bắt đầu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ② Đơn chờ thanh toán (hàng chờ) */}
      {pendingOrders.length > 0 ? (
        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-amber-700">
            <Clock className="size-4" />
            <span>Đơn chờ thanh toán ({pendingOrders.length})</span>
          </div>
          <p className="mt-1 mb-4 text-sm text-amber-700/80">
            Các đơn gia hạn bạn đã tạo nhưng chưa thanh toán. Hoàn tất để kích
            hoạt gói.
          </p>
          <div className="space-y-3">
            {pendingOrders.map((order) => {
              const pkg = packages.data?.find(
                (item) => item.id === order.packageId,
              );
              return (
                <div
                  key={order.id}
                  className="gm-panel-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      Gói {order.packageName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pkg ? formatPrice(pkg.price) : "—"} · Mã HD-{order.id}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePayOrder(order)}
                      className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
                    >
                      Thanh toán
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancelMutation.isPending}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-destructive/40 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/10 active:scale-[0.98] disabled:opacity-50"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ③ Mua / Đổi gói — LUÔN hiện (kiểu app thật) */}
      <section
        className="rounded-[1.5rem] border border-border/80 bg-[var(--surface-panel)] p-6 shadow-[var(--shadow-soft)]"
        data-testid="member-package-store"
      >
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          Mua / Đổi gói tập
        </h3>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Chọn gói phù hợp để đăng ký. Thanh toán online hoặc tại quầy lễ tân.
        </p>
        <PackageStore
          currentMembership={membership ?? null}
          pendingOrder={
            pendingOrder ? { packageName: pendingOrder.packageName } : null
          }
        />
      </section>

      {/* ③ Lịch sử hóa đơn */}
      <div className="rounded-[1.5rem] border border-border/80 bg-[var(--surface-panel)] p-6 shadow-[var(--shadow-soft)]">
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
        order={paymentOrder}
        onClose={() => setPayOpen(false)}
        onRetry={() => setPayOpen(false)}
      />
    </div>
  );
}

// Backend trả timestamp UTC nhưng EF đọc từ SQL ra Kind=Unspecified nên JSON thiếu hậu
// tố 'Z' -> new Date() hiểu nhầm thành giờ máy (lệch -7h). Ép 'Z' để parse đúng UTC.
function ensureUtcIso(value: string) {
  return /[zZ]$|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
}

function toDateInputValue(dateStr: string) {
  // Lọc theo NGÀY lịch Việt Nam (đồng bộ với ô từ ngày / đến ngày người dùng chọn).
  return vnDateIso(ensureUtcIso(dateStr));
}
