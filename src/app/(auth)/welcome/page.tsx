"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Compass,
  Salad,
  Copy,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { gymMasterAssets } from "@/lib/gymmaster-assets";

const DEMO_ACCOUNTS = [
  {
    role: "Quản trị viên",
    tag: "Admin",
    email: "admin@gymmaster.local",
    password: "Password123!",
    icon: ShieldCheck,
  },
  {
    role: "Nhân viên lễ tân",
    tag: "Staff",
    email: "staff@gymmaster.local",
    password: "Password123!",
    icon: UsersRound,
  },
  {
    role: "Huấn luyện viên PT",
    tag: "PT",
    email: "pt@gymmaster.local",
    password: "Password123!",
    icon: Dumbbell,
  },
  {
    role: "Hội viên",
    tag: "Member",
    email: "member@gymmaster.local",
    password: "Password123!",
    icon: Activity,
  },
] as const;

const ONBOARDING_SLIDES = [
  {
    title: "Huấn luyện chuyên biệt",
    description: "Theo dõi giáo án từ PT riêng, ghi nhận hiệp/reps và hẹn giờ nghỉ thông minh.",
    icon: Dumbbell,
    image: gymMasterAssets.backgrounds.ptCoachHub,
  },
  {
    title: "Nhật ký dinh dưỡng",
    description: "Ghi chép calo đồ ăn, log nước uống bento và đo BMI/Body Fat chuẩn Navy.",
    icon: Salad,
    image: gymMasterAssets.backgrounds.memberToday,
  },
  {
    title: "Vận hành lễ tân quầy",
    description: "Check-in thẻ quét thông minh, phát thông báo tiếng Việt chào mừng tiện lợi.",
    icon: Activity,
    image: gymMasterAssets.backgrounds.staffFrontdesk,
  },
] as const;

export default function WelcomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDemoSheetOpen, setIsDemoSheetOpen] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Autoplay slides on mobile
  useEffect(() => {
    if (!isMobile) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ONBOARDING_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isMobile]);

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied((prev) => ({ ...prev, [key]: true }));
        toast.success(`Đã sao chép ${label}!`);
        setTimeout(() => {
          setCopied((prev) => ({ ...prev, [key]: false }));
        }, 2000);
      })
      .catch(() => {
        toast.error("Không thể truy cập clipboard.");
      });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % ONBOARDING_SLIDES.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + ONBOARDING_SLIDES.length) % ONBOARDING_SLIDES.length);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div
          className="size-10 rounded-xl bg-contain bg-center bg-no-repeat animate-pulse"
          style={{ backgroundImage: `url(${gymMasterAssets.brand.mark})` }}
        />
      </div>
    );
  }

  // ─── MOBILE ONBOARDING VIEW ───────────────────────────────────────────
  if (isMobile) {
    const activeSlide = ONBOARDING_SLIDES[currentSlide];
    const ActiveIcon = activeSlide.icon;

    return (
      <main
        className="relative isolate flex h-dvh flex-col overflow-hidden bg-zinc-950 text-white px-6 py-6 select-none transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(8,10,15,0.7), rgba(8,10,15,0.95)), url(${activeSlide.image})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--primary)/0.12),transparent_40%)]" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="size-9 rounded-xl bg-contain bg-center bg-no-repeat shadow-md ring-1 ring-white/10"
              style={{ backgroundImage: `url(${gymMasterAssets.brand.mark})` }}
            />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                GymMaster OS
              </p>
              <p className="text-[9px] text-white/50 font-semibold tracking-wide uppercase">
                Fitness platform
              </p>
            </div>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/80 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md transition hover:bg-white/20 active:scale-95"
          >
            Tổng quan
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Swipe Slide Content (Center) */}
        <div className="flex-1 flex flex-col justify-center items-center z-10 text-center my-auto">
          <div className="w-full max-w-sm flex flex-col items-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <span className="flex size-14 items-center justify-center rounded-[1.25rem] bg-primary/15 text-primary mb-6 shadow-xl ring-1 ring-primary/20">
                  <ActiveIcon className="size-6" />
                </span>

                <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
                  {activeSlide.title}
                </h2>
                <p className="text-sm leading-6 text-white/60 max-w-xs">
                  {activeSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex items-center gap-2 mt-8">
              {ONBOARDING_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 h-2 rounded-full ${
                    currentSlide === idx ? "w-6 bg-primary" : "w-2 bg-white/30"
                  }`}
                  aria-label={`Trang ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-3 z-10 shrink-0">
          <Link
            href="/login"
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-105 active:scale-[0.98]"
          >
            Đăng nhập
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <button
            onClick={() => setIsDemoSheetOpen(true)}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 text-base font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
            type="button"
          >
            Dùng thử tài khoản Demo
          </button>
        </div>

        {/* Custom Mobile Bottom Sheet for Demo Accounts */}
        <AnimatePresence>
          {isDemoSheetOpen && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full bg-zinc-950/65 backdrop-blur-[2px]"
                onClick={() => setIsDemoSheetOpen(false)}
                aria-label="Đóng bảng tài khoản"
              />
              {/* Sheet Container */}
              <motion.div
                className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col rounded-t-[2rem] border-t border-white/10 bg-zinc-900 shadow-2xl overflow-hidden pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Drag Handle Indicator */}
                <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20" />

                {/* Title & Close Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">Tài khoản dùng thử</h3>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      Sao chép và dán vào thông tin đăng nhập
                    </p>
                  </div>
                  <button
                    className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition active:scale-95"
                    onClick={() => setIsDemoSheetOpen(false)}
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* List Accounts */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {DEMO_ACCOUNTS.map((acc, i) => {
                    const RoleIcon = acc.icon;
                    const emailKey = `mobile-email-${i}`;
                    const passKey = `mobile-pass-${i}`;
                    return (
                      <div
                        key={acc.tag}
                        className="border border-white/5 rounded-2xl bg-white/[0.03] p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-primary border border-white/10">
                            <RoleIcon className="size-4.5" />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white leading-none">{acc.role}</p>
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-primary mt-1">
                              {acc.tag}
                            </span>
                          </div>
                        </div>

                        {/* Email Row */}
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-zinc-950/80 px-3.5 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[8px] uppercase tracking-wider text-white/40">Email</p>
                            <p className="font-mono text-xs text-white truncate">{acc.email}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(acc.email, emailKey, "email")}
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition active:scale-95"
                            title="Sao chép email"
                          >
                            {copied[emailKey] ? (
                              <Check className="size-3.5 text-primary" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Password Row */}
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-zinc-950/80 px-3.5 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[8px] uppercase tracking-wider text-white/40">Mật khẩu</p>
                            <p className="font-mono text-xs text-white truncate">{acc.password}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(acc.password, passKey, "mật khẩu")}
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition active:scale-95"
                            title="Sao chép mật khẩu"
                          >
                            {copied[passKey] ? (
                              <Check className="size-3.5 text-primary" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer redirection CTA */}
                <div className="px-6 pt-3 shrink-0">
                  <Link
                    href="/login"
                    className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg transition hover:brightness-105 active:scale-[0.98]"
                  >
                    Đi tới Đăng nhập
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // ─── DESKTOP WELCOME VIEW ───────────────────────────────────────────
  return (
    <main
      className="relative isolate flex min-h-screen items-center overflow-hidden px-4 py-8"
      style={{
        backgroundImage: `linear-gradient(105deg, rgba(8,10,15,0.98), rgba(8,10,15,0.85) 46%, rgba(8,10,15,0.4)), url(${gymMasterAssets.backgrounds.welcomeGymHero})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_24%_42%,hsl(var(--primary)/0.18),transparent_26%),radial-gradient(circle_at_74%_54%,hsl(var(--primary)/0.12),transparent_24%)]" />

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
              một hệ thống thống nhất.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              Gói tập, check-in lễ tân, đếm ngược thời gian nghỉ, nhật ký ăn uống và đo TDEE/BMI tiện lợi.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-105 hover:shadow-xl active:scale-[0.98]"
              href="/login"
            >
              Đăng nhập
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>

            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 text-base font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
              href="/about"
            >
              <Compass aria-hidden="true" className="size-4" />
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
                Một không gian thống nhất
              </p>
              <p className="mt-1 text-sm leading-5 text-white/60">
                Phòng gym hoạt động liền mạch từ sảnh check-in tới khu vực tạ tập.
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
                  Phân quyền chặt chẽ
                </p>
                <p className="mt-1 text-xs leading-5 text-white/60">
                  Mở đúng không gian làm việc theo vai trò sau khi xác thực email thành công.
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
          <p className="mt-0.5 truncate text-xs text-white/60">{description}</p>
        </div>
      </div>

      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
        {value}
      </span>
    </div>
  );
}
