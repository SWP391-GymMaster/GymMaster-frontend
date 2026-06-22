"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useMember360Data } from "@/features/member-360/api/member-360.queries";
import {
  useMemberPayments,
  useCurrentMemberProfileId,
  usePackages,
  useCreateRenewalRequest,
} from "@/features/billing/api/billing.queries";
import { StatusPill } from "@/components/data/StatusPill";
import { StateBlock } from "@/components/feedback/StateBlock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, User, Activity, RefreshCw } from "lucide-react";

export function MemberMembershipDetails() {
  const memberId = useCurrentMemberProfileId();
  // Spec 003 / ADR-05 — member gui yeu cau gia han (admin/staff xac nhan sau).
  const packages = usePackages();
  const renewMutation = useCreateRenewalRequest();
  const [renewOpen, setRenewOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");

  function handleRenew() {
    const pkgId = Number(selectedPackageId);
    if (!pkgId) return;
    renewMutation.mutate(pkgId, {
      onSuccess: () => {
        toast.success("Đã gửi yêu cầu gia hạn. Lễ tân sẽ xác nhận sớm.");
        setRenewOpen(false);
        setSelectedPackageId("");
      },
      onError: () => {
        toast.error("Không gửi được yêu cầu gia hạn. Vui lòng thử lại.");
      },
    });
  }
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

  const isLoading = is360Loading || isPaymentsLoading;
  const error = error360 || errorPayments;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <StateBlock tone="loading" title="Đang tải thông tin gói tập..." />;
  }

  if (error || !memberId) {
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

  const getStatusLabel = (status: "paid" | "pending" | "refunded") => {
    if (status === "paid") return "Đã thanh toán";
    if (status === "pending") return "Đang chờ";
    return "Đã hoàn tiền";
  };

  return (
    <div className="space-y-6">
      {/* Bento Cards Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Membership Card */}
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
                      <StatusPill
                        status={membership.status}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Bạn chưa đăng ký gói tập nào.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRenewOpen(true)}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] hover:opacity-90"
          >
            <RefreshCw className="size-4" />
            {membership ? "Yêu cầu gia hạn" : "Yêu cầu đăng ký gói"}
          </button>
        </div>

        {/* PT Assignment Card */}
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

        {/* Check-in totals Card */}
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

      {/* Invoice History */}
      <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">
          Lịch sử hóa đơn thanh toán
        </h3>
        {!payments || payments.length === 0 ? (
          <StateBlock
            tone="empty"
            title="Không có hóa đơn"
            description="Bạn chưa thực hiện giao dịch thanh toán nào."
          />
        ) : (
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
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.map((payment) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent className="rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Yêu cầu gia hạn gói tập</DialogTitle>
            <DialogDescription>
              Chọn gói bạn muốn gia hạn. Yêu cầu sẽ được lễ tân/quản lý xác nhận
              và thu phí.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select
              value={selectedPackageId}
              onValueChange={setSelectedPackageId}
            >
              <SelectTrigger aria-label="Chọn gói tập">
                <SelectValue placeholder="Chọn gói tập" />
              </SelectTrigger>
              <SelectContent>
                {(packages.data ?? [])
                  .filter((p) => p.status === "active")
                  .map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} — {formatPrice(p.price)} / {p.durationDays} ngày
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {packages.isError ? (
              <p className="text-sm text-destructive">
                Không tải được danh sách gói. Vui lòng thử lại.
              </p>
            ) : null}
            <button
              type="button"
              disabled={!selectedPackageId || renewMutation.isPending}
              onClick={handleRenew}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] hover:opacity-90 disabled:opacity-50"
            >
              {renewMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu gia hạn"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
