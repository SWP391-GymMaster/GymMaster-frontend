import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { gymMasterAssets } from "@/lib/gymmaster-assets";

export default function WelcomePage() {
  return (
    <main
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-background px-4 py-8 text-white"
      style={{
        backgroundImage: `linear-gradient(105deg, rgba(8,10,15,0.98), rgba(8,10,15,0.82) 46%, rgba(8,10,15,0.36)), url(${gymMasterAssets.backgrounds.welcomeGymHero})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_24%_42%,hsl(var(--primary)/0.18),transparent_26%),radial-gradient(circle_at_74%_54%,hsl(var(--primary)/0.12),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-background/20 to-transparent" />

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[minmax(0,1fr)_390px] md:items-end">
        <div>
          <div className="mb-9 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-14 rounded-[1.25rem] bg-contain bg-center bg-no-repeat shadow-xl shadow-background/40 ring-1 ring-white/10"
              style={{ backgroundImage: `url(${gymMasterAssets.brand.mark})` }}
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                GymMaster OS
              </p>
              <p className="text-sm text-white/70">
                Fitness operations platform
              </p>
            </div>
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur-md">
            <Sparkles aria-hidden="true" className="size-3.5" />
            Hệ thống quản lý phòng gym
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.02]">
            Chào mừng đến GymMaster OS
          </h1>

          <div className="mt-10 max-w-2xl border-l border-primary/50 pl-5">
            <p className="text-base font-medium text-white leading-7">
              Kết nối, quản lý vận hành, huấn luyện và dữ liệu hội viên trong
              một hệ thống.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/58">
              Quản lý gói tập, check-in, lịch sử tập luyện và tiến độ hội viên
              hiệu quả.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-105 hover:shadow-xl active:scale-[0.98]"
              href="/login"
            >
              Bắt đầu
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>

            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-base font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
              href="#overview"
            >
              Xem tổng quan
            </Link>
          </div>
        </div>

        <div
          id="overview"
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.09] p-5 shadow-2xl shadow-background/30 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 size-52 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Dumbbell aria-hidden="true" className="size-6" />
            </span>

            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-white">
                Một không gian vận hành thống nhất
              </p>
              <p className="mt-1 text-sm leading-5 text-white/64">
                Quản lý phòng gym, đội ngũ và hành trình hội viên trong cùng một
                hệ thống.
              </p>
            </div>
          </div>

          <div className="relative mt-6 grid gap-2.5">
            <WelcomeFeature
              icon={<UsersRound aria-hidden="true" className="size-4" />}
              title="Quản lý"
              description="Hội viên, nhân sự, gói tập"
              value="Tập trung"
            />
            <WelcomeFeature
              icon={<Activity aria-hidden="true" className="size-4" />}
              title="Vận hành"
              description="Bán gói, gia hạn, check-in"
              value="Liền mạch"
            />
            <WelcomeFeature
              icon={<BadgeCheck aria-hidden="true" className="size-4" />}
              title="Huấn luyện"
              description="Workout, ghi chú, tiến độ"
              value="Cá nhân hóa"
            />
          </div>

          <div className="relative mt-5 rounded-[1.35rem] border border-white/10 bg-background/10 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <ShieldCheck aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Truy cập cá nhân hóa
                </p>
                <p className="mt-1 text-xs leading-5 text-white/58">
                  Hệ thống tự xác định quyền truy cập và mở đúng không gian làm
                  việc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function WelcomeFeature({
  icon,
  title,
  description,
  value,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-background/10 px-4 py-3.5 text-sm transition-colors hover:bg-background/15">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary ring-1 ring-white/10">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-white">{title}</p>
          <p className="mt-0.5 truncate text-xs text-white/58">{description}</p>
        </div>
      </div>

      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
        {value}
      </span>
    </div>
  );
}
