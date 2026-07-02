"use client";

import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

import { formatVnDate, vnDateIso, vnTodayIso } from "@/lib/date/vn-time";

type MembershipExpiryBannerProps = {
  endDate?: string;
  status?: string;
  className?: string;
};

// So ngay con lai tinh theo NGAY lich gio VN (nhat quan toan app, on dinh theo bien
// nua dem VN — khong lech theo gio/ mui gio trinh duyet). Tach ham rieng de tranh
// loi lint react-hooks/purity "impure function during render".
function getDaysLeft(endDate: string): number {
  const end = new Date(`${vnDateIso(endDate)}T00:00:00Z`).getTime();
  const today = new Date(`${vnTodayIso()}T00:00:00Z`).getTime();
  return Math.round((end - today) / 86400000);
}

export function MembershipExpiryBanner({
  endDate,
  status,
  className,
}: MembershipExpiryBannerProps) {
  if (!endDate) {
    return null;
  }

  const daysLeft = getDaysLeft(endDate);

  const expiryDate = formatVnDate(endDate, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const isExpired =
    status === "expired" || (status === "active" && daysLeft < 0);
  const isUrgent = status === "active" && daysLeft <= 3;
  const isSoon = status === "active" && daysLeft <= 7;

  if (!isExpired && !isUrgent && !isSoon) {
    return null;
  }

  const wrapperClassName =
    "rounded-2xl border px-4 py-4 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between " +
    (className ?? "");

  if (isExpired || isUrgent) {
    return (
      <div className={`${wrapperClassName} bg-red-50 text-red-700 border-red-200`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-5" />
          <p className="text-sm font-medium leading-6">
            {isExpired
              ? "Gói tập đã hết hạn — gia hạn để tiếp tục sử dụng."
              : `Gói tập sắp hết hạn — chỉ còn ${daysLeft} ngày!`}
          </p>
        </div>
        <Link
          href="/member/membership"
          className="inline-flex h-10 items-center justify-center rounded-full border border-current bg-white/90 px-4 text-sm font-semibold text-current transition hover:bg-white"
        >
          Gia hạn
        </Link>
      </div>
    );
  }

  return (
    <div className={`${wrapperClassName} bg-amber-50 text-amber-800 border-amber-200`}>
      <div className="flex items-center gap-3">
        <Clock className="size-5" />
        <p className="text-sm font-medium leading-6">
          Gói tập của bạn còn {daysLeft} ngày (đến {expiryDate}).
        </p>
      </div>
      <Link
        href="/member/membership"
        className="inline-flex h-10 items-center justify-center rounded-full border border-current bg-white/90 px-4 text-sm font-semibold text-current transition hover:bg-white"
      >
        Gia hạn
      </Link>
    </div>
  );
}
