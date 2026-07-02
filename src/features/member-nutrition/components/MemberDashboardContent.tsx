"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Salad,
  TrendingUp,
  User,
  Utensils,
} from "lucide-react";

import { StatusPill } from "@/components/data/StatusPill";
import { Button } from "@/components/ui/button";
import { MembershipExpiryBanner } from "@/features/billing/components/MembershipExpiryBanner";
import { NutritionSummaryCard } from "@/features/member-nutrition/components/NutritionSummaryCard";
import { WaterTrackerCard } from "@/features/member-nutrition/components/WaterTrackerCard";
import { useMemberCalorieSummary } from "@/features/member-nutrition/api/member-nutrition.queries";
import { getTodayDate } from "@/features/member-nutrition/utils/nutrition-formatters";
import { gymMasterAssets } from "@/lib/gymmaster-assets";
import { formatVnDate } from "@/lib/date/vn-time";
import { useCurrentMemberProfileId } from "@/features/billing/api/billing.queries";
import { useMember360Data } from "@/features/member-360/api/member-360.queries";
import { BmiCalculator } from "@/features/member-nutrition/components/BmiCalculator";

const today = getTodayDate();

const todayActions = [
  {
    href: "/member/nutrition/meal-journal",
    title: "Ghi bữa ăn",
    description: "Thêm món, khẩu phần và loại bữa cho nhật ký hôm nay.",
    icon: Salad,
  },
  {
    href: "/member/workout",
    title: "Xem giáo án",
    description: "Kiểm tra bài tập, số hiệp, reps và cue kỹ thuật từ PT.",
    icon: Dumbbell,
  },
  {
    href: "/member/notes",
    title: "Ghi chú PT",
    description: "Đọc phản hồi mới nhất về kỹ thuật và phục hồi.",
    icon: CheckCircle2,
  },
  {
    href: "/member/progress",
    title: "Theo dõi tiến độ",
    description: "Ghi nhận cân nặng, tỷ lệ mỡ và xem biểu đồ cơ thể.",
    icon: TrendingUp,
  },
];

export function MemberDashboardContent() {
  const summary = useMemberCalorieSummary(today);
  const memberId = useCurrentMemberProfileId();
  const { data: member360 } = useMember360Data(memberId);
  const membership = member360?.currentMembership;
  const pt = member360?.assignedPT;
  const checkIns = member360?.recentCheckIns ?? [];
  const calorieGoal = summary.data?.target ?? null;

  const [isBmiOpen, setIsBmiOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <MembershipExpiryBanner endDate={membership?.endDate} status={membership?.status} />
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative min-h-[260px] lg:min-h-[410px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950 shadow-xl">
          <div
            className="absolute inset-0 scale-[1.03]"
            style={{
              backgroundImage: `url(${gymMasterAssets.operationsCover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(34,197,94,0.32),transparent_34%),linear-gradient(90deg,rgba(3,7,6,0.96)_0%,rgba(3,7,6,0.84)_38%,rgba(3,7,6,0.48)_68%,rgba(3,7,6,0.28)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="relative flex min-h-[260px] lg:min-h-[410px] flex-col justify-between p-5 lg:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-primary shadow-sm backdrop-blur-md">
                  <Utensils aria-hidden="true" className="size-5" />
                </span>
                <p className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-md">
                  Today Command Center
                </p>
                <StatusPill
                  className="border-primary/25 bg-primary/15 text-primary shadow-sm backdrop-blur-md"
                  label={
                    membership?.status === "active"
                      ? "Gói active"
                      : membership?.status === "pending_payment"
                        ? "Chờ thanh toán"
                        : membership?.status === "expired"
                          ? "Hết hạn"
                          : "Chưa có gói"
                  }
                  status={
                    membership?.status === "active"
                      ? "active"
                      : membership?.status === "pending_payment"
                        ? "pending"
                        : membership?.status === "expired"
                          ? "expired"
                          : "locked"
                  }
                />
              </div>

              <h2 className="mt-4 lg:mt-7 max-w-3xl text-2xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Hôm nay tập gì, ăn gì và còn bao nhiêu calo?
              </h2>
              <p className="mt-2 lg:mt-4 max-w-2xl text-xs lg:text-base leading-relaxed text-zinc-200/90 line-clamp-2 lg:line-clamp-none">
                Theo dõi nhanh giáo án, dinh dưỡng và trạng thái hội viên trong
                một màn hình, ưu tiên đúng hành động tiếp theo.
              </p>
            </div>

            <div>
              <div className="grid gap-3 sm:grid-cols-3">
                <HeroChip label="Mục tiêu" value={calorieGoal != null ? `${calorieGoal.toLocaleString("vi-VN")} kcal` : "Chưa đặt"} variant="glass" />
                <HeroChip label="Buổi tiếp theo" value="18:30" variant="glass" />
                <HeroChip label="Check-in" value="Sẵn sàng" variant="glass" />
              </div>

              <div className="mt-4 lg:mt-5 flex flex-wrap gap-2">
                <Button
                  asChild
                  className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-95 active:scale-[0.98]"
                >
                  <Link href="/member/nutrition/meal-journal">Thêm bữa ăn</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-xl border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/15 active:scale-[0.98]"
                  variant="outline"
                >
                  <Link href="/member/workout">Xem giáo án</Link>
                </Button>
                <Button
                  onClick={() => setIsBmiOpen(true)}
                  className="rounded-xl border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/15 active:scale-[0.98] transition"
                  variant="outline"
                  type="button"
                >
                  Đo BMI & Mỡ
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="grid gap-2.5 grid-cols-2 lg:grid-cols-1 lg:gap-3">
          {todayActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                className="gm-interactive-card group flex items-center gap-2.5 p-3 active:scale-[0.98] lg:gap-4 lg:p-4"
                href={action.href}
                key={action.href}
              >
                <span className="flex size-9 lg:size-11 shrink-0 items-center justify-center rounded-xl lg:rounded-full bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-4.5 lg:size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-xs lg:text-sm text-foreground truncate">
                    {action.title}
                  </span>
                  <span className="mt-0.5 hidden lg:block text-xs leading-5 text-muted-foreground line-clamp-2">
                    {action.description}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 lg:size-4 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            );
          })}
        </aside>
      </section>

      {/* PT + Check-in gần đây */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="gm-panel p-5">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <User aria-hidden="true" className="size-4 text-primary" />
            <span>Huấn luyện viên cá nhân</span>
          </div>
          {pt ? (
            <div className="mt-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {pt.fullName}
              </h3>
              <p className="mt-1 text-sm font-semibold text-primary">
                {pt.specialty}
              </p>
              <p className="mt-3 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                Phân công từ{" "}
                {formatVnDate(pt.assignedAt, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Bạn chưa được chỉ định huấn luyện viên cá nhân.
            </p>
          )}
        </div>

        <div className="gm-panel p-5">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <CalendarCheck aria-hidden="true" className="size-4 text-primary" />
            <span>Check-in gần đây</span>
          </div>
          <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">
            Tổng {checkIns.length} lượt
          </h3>
          <div className="mt-3 space-y-2 border-t border-border/60 pt-3 text-sm">
            {checkIns.length > 0 ? (
              checkIns.slice(0, 2).map((ci) => (
                <div className="flex justify-between" key={ci.id}>
                  <span className="text-muted-foreground">Đã vào lúc</span>
                  <span className="font-semibold text-foreground">
                    {formatVnDate(ci.checkInAt, {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Chưa ghi nhận check-in.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <NutritionSummaryCard
          isError={summary.isError}
          isLoading={summary.isLoading}
          summary={summary.data}
        />

        <aside className="grid gap-4">
          <SupportCard
            href="/member/nutrition/summary"
            icon={TrendingUp}
            image={gymMasterAssets.nutritionCover}
            title="Tổng kết calo"
            description="Xem calo đã ăn, còn lại và macro trong ngày."
          />
          <WaterTrackerCard />
        </aside>
      </section>

      <BmiCalculator open={isBmiOpen} onOpenChange={setIsBmiOpen} />
    </div>
  );
}

function HeroChip({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "glass";
}) {
  if (variant === "glass") {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/[0.14] p-4 shadow-sm backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
          {label}
        </p>
        <p className="mt-1 text-base font-semibold text-white">{value}</p>
      </div>
    );
  }

  return (
    <div className="gm-panel-muted p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SupportCard({
  description,
  href,
  icon: Icon,
  image,
  title,
}: {
  description: string;
  href: string;
  icon: typeof CalendarCheck;
  image: string;
  title: string;
}) {
  return (
    <Link
      className="gm-interactive-card group overflow-hidden active:scale-[0.98]"
      href={href}
    >
      <div
        className="h-24 bg-zinc-950"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(24,24,27,0.08), rgba(24,24,27,0.62)), url(${image})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="p-5">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        <h2 className="mt-3 text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}
