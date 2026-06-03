"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CloudLightning,
  Compass,
  Copy,
  Cpu,
  Dumbbell,
  Layers,
  Printer,
  ShieldCheck,
  Sparkles,
  Timer,
  UsersRound,
  Volume2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { gymMasterAssets } from "@/lib/gymmaster-assets";

// ─── Constants ───────────────────────────────────────────────────────────────

const PASSWORD = "Password123!";

const DEMO_ACCOUNTS = [
  {
    role: "Quản trị viên",
    tag: "Admin",
    email: "admin@gymmaster.local",
    accent: "destructive" as const,
    icon: ShieldCheck,
  },
  {
    role: "Nhân viên lễ tân",
    tag: "Staff",
    email: "staff@gymmaster.local",
    accent: "steel" as const,
    icon: UsersRound,
  },
  {
    role: "Huấn luyện viên PT",
    tag: "PT",
    email: "pt@gymmaster.local",
    accent: "pending" as const,
    icon: Dumbbell,
  },
  {
    role: "Hội viên",
    tag: "Member",
    email: "member@gymmaster.local",
    accent: "active" as const,
    icon: Activity,
  },
] as const;

const WORKSPACE_CARDS = [
  {
    role: "Admin",
    title: "Ban Quản Trị",
    subtitle: "Admin Panel",
    desc: "Trung tâm kiểm soát cấp cao, chịu trách nhiệm quản trị hệ thống, nhân sự, gói cước và phân công HLV.",
    icon: ShieldCheck,
    accent: "destructive" as const,
    bullets: [
      "Quản lý danh sách Nhân sự, HLV, Hội viên toàn hệ thống",
      "Phân công / thay đổi Huấn luyện viên cá nhân cho Hội viên",
      "Theo dõi lịch sử Audit logs bảo mật chi tiết từng hành động",
    ],
    cover: gymMasterAssets.backgrounds.adminOperations,
  },
  {
    role: "Staff",
    title: "Lễ Tân Front-Desk",
    subtitle: "Staff Console",
    desc: "Giải quyết nhanh chóng các dịch vụ tại sảnh, check-in, bán/gia hạn thẻ thành viên và tra soát thanh toán.",
    icon: UsersRound,
    accent: "steel" as const,
    bullets: [
      "Quét kiểm tra thẻ check-in và phát cảnh báo giọng nói tự động",
      "Wizard 3 bước bán gói tập & lập hóa đơn tức thì tại quầy",
      "Tra cứu & gia hạn nhanh thẻ thành viên không cần giấy tờ",
    ],
    cover: gymMasterAssets.backgrounds.staffFrontdesk,
  },
  {
    role: "PT",
    title: "Huấn Luyện Viên",
    subtitle: "Trainer Workspace",
    desc: "Đồng hành trực tiếp cùng hội viên, thiết lập giáo án và đánh giá kết quả luyện tập chuyên môn.",
    icon: Dumbbell,
    accent: "pending" as const,
    bullets: [
      "Thiết kế giáo án workout theo hiệp / nghỉ / reps chi tiết",
      "Ghi nhận nhận xét, đánh giá thể trạng và phục hồi hội viên",
      "Theo dõi nhanh chỉ số cơ thể, cân nặng, tiến độ hội viên",
    ],
    cover: gymMasterAssets.backgrounds.ptCoachHub,
  },
  {
    role: "Member",
    title: "Hội Viên Cá Nhân",
    subtitle: "Member Hub",
    desc: "Trải nghiệm tập luyện tối ưu trên di động, quản lý dinh dưỡng, lượng nước uống và tiến trình cá nhân.",
    icon: Activity,
    accent: "active" as const,
    bullets: [
      "Theo dõi giáo án huấn luyện từ PT và hẹn giờ nghỉ giữa hiệp",
      "Log nước uống bento động & nhật ký ăn uống calo hàng ngày",
      "Đo chỉ số mỡ cơ thể Body Fat % & TDEE khoa học Navy Formula",
    ],
    cover: gymMasterAssets.backgrounds.memberToday,
  },
];

const INNOVATIONS = [
  {
    icon: Timer,
    title: "Hẹn giờ nghỉ toàn cục & Rung",
    desc: "Zustand Store giữ timer chạy ngầm khi chuyển trang. Web Audio API phát bíp và Vibration API rung máy báo hết giờ trong lúc tập.",
  },
  {
    icon: Volume2,
    title: "Đọc giọng check-in lễ tân",
    desc: "Web Speech API tiếng Việt chào mừng thành viên hoặc cảnh báo thẻ hết hạn tự động — giải phóng đôi mắt cho nhân viên.",
  },
  {
    icon: CloudLightning,
    title: "Hàng chờ đồng bộ Offline",
    desc: "Mất kết nối vẫn ghi chép nước uống/calo bình thường. Khi có mạng, client tự gửi đồng bộ dữ liệu ngầm lên hệ thống.",
  },
  {
    icon: Cpu,
    title: "Navy Body Fat Calculator",
    desc: "Nhập số đo eo, cổ, cân nặng bằng thanh trượt để tính mỡ cơ thể và BMI theo chuẩn Hải quân Mỹ — biểu đồ cung tròn SVG.",
  },
  {
    icon: Printer,
    title: "In ấn giáo án thông minh",
    desc: "Media print ẩn 100% sidebar và menu. Tùy chọn ẩn ghi chú hoặc tên PT để xuất bản in sạch nhất cho hội viên.",
  },
  {
    icon: Sparkles,
    title: "Circular View Transition",
    desc: "View Transitions API tạo hiệu ứng vòng tròn lan tỏa từ tâm click chuột khi người dùng chuyển đổi theme sáng/tối.",
  },
];

const TECH_STACK = [
  "Next.js 15",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "TanStack Query",
  "TanStack Table",
  "React Hook Form",
  "Zod",
  "Zustand",
  "Recharts",
  "Framer Motion",
  "MSW",
  "Sonner",
  "Vitest",
  "Playwright",
];

// ─── Accent token map ─────────────────────────────────────────────────────────
// Maps accent keys to semantic status token classes from globals.css

const ACCENT = {
  active: {
    badge:
      "bg-[var(--status-active-bg)] text-[var(--status-active-text)] border-[var(--status-active-border)]",
    icon: "bg-[var(--status-active-bg)] text-[var(--status-active-text)] border-[var(--status-active-border)]",
    glow: "bg-primary",
  },
  pending: {
    badge:
      "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)] border-[var(--status-pending-border)]",
    icon: "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)] border-[var(--status-pending-border)]",
    glow: "bg-[var(--status-pending-bg)]",
  },
  steel: {
    badge:
      "bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info-border)]",
    icon: "bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info-border)]",
    glow: "bg-[var(--status-info-bg)]",
  },
  destructive: {
    badge:
      "bg-[var(--status-failed-bg)] text-[var(--status-failed-text)] border-[var(--status-failed-border)]",
    icon: "bg-[var(--status-failed-bg)] text-[var(--status-failed-text)] border-[var(--status-failed-border)]",
    glow: "bg-[var(--status-failed-bg)]",
  },
} as const;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AboutPage() {
  const [copied, setCopied] = useState<Record<string, boolean>>({});

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

  return (
    <div className="min-h-screen scroll-smooth overflow-y-auto bg-background text-foreground">
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="size-8 rounded-xl bg-contain bg-center bg-no-repeat ring-1 ring-border"
            style={{ backgroundImage: `url(${gymMasterAssets.brand.mark})` }}
          />
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            GymMaster OS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/welcome"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:brightness-105 active:scale-[0.98]"
          >
            Đăng nhập
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative isolate flex min-h-[52vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, var(--background) 0%, color-mix(in oklch, var(--background) 35%, transparent) 50%, var(--background) 100%), url(${gymMasterAssets.backgrounds.welcomeGymHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--primary) 15%, transparent), transparent 55%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
            <Layers className="size-3.5" />
            Tổng quan hệ thống
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-[1.04]">
            GymMaster OS
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Nền tảng vận hành phòng gym toàn diện — từ check-in lễ tân, bán gói
            tập đến giáo án huấn luyện và theo dõi dinh dưỡng cá nhân hóa.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-105 active:scale-[0.98]"
            >
              Bắt đầu dùng thử
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#workspaces"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-[0.98]"
            >
              <Compass className="size-4" />
              Khám phá workspace
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-28 px-4 pb-28 pt-20">
        {/* ── Section 2: Workspace Bento Grid ───────────────────── */}
        <section id="workspaces" className="scroll-mt-24">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Role Workspaces
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Không Gian Làm Việc Phân Vai
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Hệ thống chia làm 4 giao diện nghiệp vụ riêng biệt, phục vụ đầy đủ
              vòng đời vận hành của câu lạc bộ thể hình chuyên nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {WORKSPACE_CARDS.map((card) => {
              const Icon = card.icon;
              const a = ACCENT[card.accent];
              return (
                <div
                  key={card.role}
                  className="group relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="h-32 w-full"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, color-mix(in oklch, var(--card) 6%, transparent), color-mix(in oklch, var(--card) 75%, transparent)), url(${card.cover})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* Hover glow */}
                  <div
                    className={`pointer-events-none absolute right-6 top-6 size-28 rounded-full blur-2xl ${a.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-30`}
                  />

                  <div className="relative p-7">
                    <div className="mb-5 flex items-center gap-3">
                      <span
                        className={`flex size-11 items-center justify-center rounded-2xl border ${a.icon}`}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="text-lg font-bold leading-tight text-card-foreground">
                          {card.title}
                        </p>
                        <span
                          className={`mt-0.5 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${a.badge}`}
                        >
                          {card.subtitle}
                        </span>
                      </div>
                    </div>

                    <p className="mb-5 text-sm leading-6 text-muted-foreground">
                      {card.desc}
                    </p>

                    <ul className="space-y-2.5 border-t border-border pt-4">
                      {card.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-xs text-muted-foreground"
                        >
                          <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section 3: Tech Stack ─────────────────────────────── */}
        <section>
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Tech Stack
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Được xây dựng trên nền tảng hiện đại
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm transition hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
              >
                <Zap className="size-3 text-primary/60" />
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* ── Section 4: Client-Side Innovations ───────────────── */}
        <section id="innovations">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Client-Side Innovations
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Trải Nghiệm Vượt Trội Phía Client
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Không phụ thuộc server-side — frontend tận dụng Web API phần cứng
              để mang lại phản hồi tức thì và tiện lợi tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INNOVATIONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h4 className="mb-2 text-sm font-bold text-card-foreground">
                    {item.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section 5: Demo Sandbox ───────────────────────────── */}
        <section id="demo" className="scroll-mt-24">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-sm md:p-12">
            {/* Decorative glows */}
            <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-primary/8 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -top-20 size-52 rounded-full bg-muted blur-3xl" />

            <div className="relative mb-10 max-w-xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Demo Sandbox
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-card-foreground md:text-3xl">
                Tài Khoản Thử Nghiệm
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                GymMaster OS phân quyền tự động sau khi đăng nhập. Sử dụng các
                tài khoản dưới đây để đánh giá từng giao diện nghiệp vụ.
              </p>
            </div>

            {/* Credential cards */}
            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((acc, i) => {
                const Icon = acc.icon;
                const a = ACCENT[acc.accent];
                const emailKey = `email-${i}`;
                const passKey = `pass-${i}`;
                return (
                  <div
                    key={acc.tag}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-border bg-muted/40 p-5 transition hover:border-primary/20 hover:bg-accent/30"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className={`flex size-9 items-center justify-center rounded-xl border ${a.icon}`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {acc.role}
                        </p>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${a.badge.split(" ").find((s) => s.startsWith("text-"))}`}
                        >
                          {acc.tag}
                        </span>
                      </div>
                    </div>

                    {/* Email row */}
                    <div className="mb-2.5 flex items-center justify-between gap-2 rounded-xl border border-input bg-background px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="mb-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                          Email
                        </p>
                        <p className="truncate font-mono text-xs text-foreground">
                          {acc.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(acc.email, emailKey, "email")}
                        className="shrink-0 rounded-lg border border-border bg-muted p-1.5 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground active:scale-[0.96]"
                        title="Sao chép email"
                      >
                        {copied[emailKey] ? (
                          <Check className="size-3.5 text-primary" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Password row */}
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-input bg-background px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="mb-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                          Mật khẩu
                        </p>
                        <p className="truncate font-mono text-xs text-foreground">
                          {PASSWORD}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(PASSWORD, passKey, "mật khẩu")
                        }
                        className="shrink-0 rounded-lg border border-border bg-muted p-1.5 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground active:scale-[0.96]"
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

            {/* CTA row */}
            <div className="relative mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 sm:flex-row">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Sao chép email & mật khẩu, sau đó dán vào trang đăng nhập để
                  trải nghiệm từng vai trò nghiệp vụ.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:brightness-105 active:scale-[0.98]"
              >
                Đi tới Đăng nhập
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-7 rounded-lg bg-contain bg-center bg-no-repeat ring-1 ring-border"
              style={{ backgroundImage: `url(${gymMasterAssets.brand.mark})` }}
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              GymMaster OS
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            SWP391 Course Project · Frontend Demo
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
          >
            Bắt đầu dùng thử
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
