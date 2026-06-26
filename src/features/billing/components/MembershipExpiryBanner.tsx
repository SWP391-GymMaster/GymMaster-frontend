"use client";

import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

type MembershipExpiryBannerProps = {
  endDate?: string;
  status?: string;
  className?: string;
};

// Tinh o ham rieng (khong goi Date.now() truc tiep trong than component) de tranh
// loi lint react-hooks/purity "impure function during render".
function getDaysLeft(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
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

  const expiryDate = new Date(endDate).toLocaleDateString("vi-VN", {
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
