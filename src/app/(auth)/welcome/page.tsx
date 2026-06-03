"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Copy,
  Check,
  Cpu,
  Volume2,
  Timer,
  CloudLightning,
  Printer,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { gymMasterAssets } from "@/lib/gymmaster-assets";

export default function WelcomePage() {
  const [copiedText, setCopiedText] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText((prev) => ({ ...prev, [key]: true }));
    toast.success(`Đã sao chép ${label}!`);
    setTimeout(() => {
      setCopiedText((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const demoAccounts = [
    { role: "Quản trị viên (Admin)", email: "admin@gymmaster.local", label: "Email Admin" },
    { role: "Nhân viên lễ tân (Staff)", email: "staff@gymmaster.local", label: "Email Nhân viên" },
    { role: "Huấn luyện viên (PT)", email: "pt@gymmaster.local", label: "Email HLV" },
    { role: "Hội viên (Member)", email: "member@gymmaster.local", label: "Email Hội viên" },
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-zinc-950 text-white scroll-smooth pb-24">
      {/* Hero Section */}
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
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-base font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
                href="#workspaces"
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

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
          <span className="text-xs tracking-wider">Cuộn xem thêm</span>
          <ChevronDown className="size-4" />
        </div>
      </main>

      {/* Landing Scroll Contents */}
      <div className="mx-auto max-w-6xl px-4 mt-20 space-y-28">
        
        {/* Section 2: Bento grid of 4 workspaces */}
        <section id="workspaces" className="scroll-mt-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Không Gian Làm Việc Phân Vai (Role Workspaces)
            </h2>
            <p className="mt-3 text-white/60 max-w-2xl mx-auto">
              Hệ thống chia làm 4 giao diện nghiệp vụ riêng biệt, phục vụ đầy đủ vòng đời vận hành của câu lạc bộ thể hình chuyên nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Admin */}
            <div className="group relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/[0.06] duration-300">
              <div className="absolute top-8 right-8 text-primary/20 group-hover:text-primary/45 transition">
                <ShieldCheck className="size-16" />
              </div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-6">
                <ShieldCheck className="size-6" />
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Ban Quản Trị (Admin Panel)</h3>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Trung tâm kiểm soát cấp cao, chịu trách nhiệm quản trị hệ thống, nhân sự, gói cước và phân công HLV.
              </p>
              <ul className="space-y-2 text-xs text-white/50 border-t border-white/5 pt-4">
                <li className="flex items-center gap-2">✓ Quản lý danh sách Nhân sự, HLV, Hội viên</li>
                <li className="flex items-center gap-2">✓ Phân công/Thay đổi Huấn luyện viên cho Hội viên</li>
                <li className="flex items-center gap-2">✓ Theo dõi lịch sử Audit logs bảo mật chi tiết</li>
              </ul>
            </div>

            {/* Card Staff */}
            <div className="group relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/[0.06] duration-300">
              <div className="absolute top-8 right-8 text-primary/20 group-hover:text-primary/45 transition">
                <UsersRound className="size-16" />
              </div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
                <UsersRound className="size-6" />
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Lễ Tân Front-Desk (Staff Console)</h3>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Giải quyết nhanh chóng các dịch vụ tại sảnh, check-in, bán/gia hạn thẻ thành viên và thu chi.
              </p>
              <ul className="space-y-2 text-xs text-white/50 border-t border-white/5 pt-4">
                <li className="flex items-center gap-2">✓ Quét kiểm tra thẻ check-in phát cảnh báo giọng nói</li>
                <li className="flex items-center gap-2">✓ Wizard 3 bước bán gói tập & lập hóa đơn tức thì</li>
                <li className="flex items-center gap-2">✓ Tra cứu & gia hạn nhanh thẻ thành viên tại quầy</li>
              </ul>
            </div>

            {/* Card PT */}
            <div className="group relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/[0.06] duration-300">
              <div className="absolute top-8 right-8 text-primary/20 group-hover:text-primary/45 transition">
                <Dumbbell className="size-16" />
              </div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
                <Dumbbell className="size-6" />
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Huấn Luyện Viên (Trainer Workspace)</h3>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Đồng hành trực tiếp cùng hội viên, thiết lập giáo án và đánh giá kết quả luyện tập chuyên môn.
              </p>
              <ul className="space-y-2 text-xs text-white/50 border-t border-white/5 pt-4">
                <li className="flex items-center gap-2">✓ Thiết kế giáo án workout chia hiệp/nghỉ chi tiết</li>
                <li className="flex items-center gap-2">✓ Ghi nhận nhận xét, đánh giá thể trạng hội viên</li>
                <li className="flex items-center gap-2">✓ Xem nhanh chỉ số cơ thể, cân nặng hội viên</li>
              </ul>
            </div>

            {/* Card Member */}
            <div className="group relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/[0.06] duration-300">
              <div className="absolute top-8 right-8 text-primary/20 group-hover:text-primary/45 transition">
                <Activity className="size-16" />
              </div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-400 border border-lime-500/20 mb-6">
                <Activity className="size-6" />
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Hội Viên Cá Nhân (Member Hub)</h3>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Trải nghiệm tập luyện tối ưu trên di động, quản lý dinh dưỡng, lượng nước uống và tiến trình cá nhân.
              </p>
              <ul className="space-y-2 text-xs text-white/50 border-t border-white/5 pt-4">
                <li className="flex items-center gap-2">✓ Theo dõi giáo án huấn luyện từ PT và hẹn giờ nghỉ</li>
                <li className="flex items-center gap-2">✓ Log nước uống bento dâng động & nhật ký ăn uống calo</li>
                <li className="flex items-center gap-2">✓ Đo chỉ số mỡ cơ thể (Body Fat %) & TDEE khoa học</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Tech Innovations */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Nâng Cấp Trải Nghiệm Client-Side Vượt Trội
            </h2>
            <p className="mt-3 text-white/60 max-w-2xl mx-auto">
              Không phụ thuộc vào server-side, frontend tối ưu hóa API phần cứng để mang lại phản hồi tức thì và sự tiện lợi tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Timer className="size-5" />
              </span>
              <h4 className="text-base font-bold mb-2">Hẹn giờ nghỉ toàn cục & Rung</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Zustand Store giữ giờ chạy ngầm khi chuyển trang. Web Audio API tự phát bíp và Vibration API rung máy báo hết giờ khi đang tập luyện.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Volume2 className="size-5" />
              </span>
              <h4 className="text-base font-bold mb-2">Đọc giọng check-in lễ tân</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Tích hợp Web Speech API tiếng Việt chào mừng thành viên hoặc cảnh báo thẻ hết hạn tự động, giải phóng đôi mắt cho nhân viên.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <CloudLightning className="size-5" />
              </span>
              <h4 className="text-base font-bold mb-2">Hàng chờ đồng bộ Offline</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Mất kết nối mạng vẫn ghi chép nước uống/calo bình thường. Khi có mạng lại, client tự động gửi đồng bộ dữ liệu ngầm lên hệ thống.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Cpu className="size-5" />
              </span>
              <h4 className="text-base font-bold mb-2">Navy Body Fat Calculator</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Nhập số đo eo, cổ, cân nặng bằng thanh trượt trực quan để tính nhanh mỡ cơ thể và BMI theo chuẩn Hải quân Mỹ với biểu đồ cung tròn SVG.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Printer className="size-5" />
              </span>
              <h4 className="text-base font-bold mb-2">In ấn giáo án thông minh</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Sử dụng `@media print` ẩn 100% sidebars, menu và nút thao tác. Tùy chọn ẩn ghi chú hoặc tên PT để xuất bản in sạch sẽ nhất.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Sparkles className="size-5" />
              </span>
              <h4 className="text-base font-bold mb-2">Circular View Theme Switcher</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Tận dụng View Transitions API để vẽ hiệu ứng vòng tròn lan tỏa mượt mà từ tâm điểm click chuột khi người dùng chuyển đổi theme.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Demo Sandbox Credentials Table */}
        <section className="scroll-mt-20">
          <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="pointer-events-none absolute -right-24 -bottom-24 size-64 rounded-full bg-primary/10 blur-3xl" />
            
            <div className="mb-8 text-left max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-white">
                Trợ Lý Thử Nghiệm (Demo Sandbox Credentials)
              </h2>
              <p className="mt-2 text-xs text-white/50">
                GymMaster OS quản lý vai trò tự động sau khi đăng nhập. Sử dụng các tài khoản kiểm thử dưới đây để đánh giá các góc nhìn nghiệp vụ tương ứng:
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
              <table className="w-full text-left text-sm text-white/80 border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/60">
                    <th className="px-5 py-4">Không gian vai trò</th>
                    <th className="px-5 py-4">Tài khoản (Email)</th>
                    <th className="px-5 py-4">Mật khẩu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {demoAccounts.map((acc, index) => {
                    const emailKey = `email-${index}`;
                    const passKey = `pass-${index}`;
                    const password = "Password123!";

                    return (
                      <tr key={index} className="hover:bg-white/[0.02] transition">
                        <td className="px-5 py-4 font-medium text-white text-xs sm:text-sm">
                          {acc.role}
                        </td>
                        <td className="px-5 py-4 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span>{acc.email}</span>
                            <button
                              onClick={() => handleCopy(acc.email, emailKey, acc.label)}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition"
                              title="Sao chép email"
                            >
                              {copiedText[emailKey] ? (
                                <Check className="size-3.5 text-primary" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span>{password}</span>
                            <button
                              onClick={() => handleCopy(password, passKey, "Mật khẩu")}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition"
                              title="Sao chép mật khẩu"
                            >
                              {copiedText[passKey] ? (
                                <Check className="size-3.5 text-primary" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <p className="text-xs text-white/70 leading-relaxed">
                  Bấm sao chép nhanh email và mật khẩu của vai trò bạn muốn kiểm tra, sau đó click nút <strong>&quot;Đăng nhập&quot;</strong> bên dưới để dán thông tin.
                </p>
              </div>
              <Link
                href="/login"
                className="shrink-0 inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:brightness-105 active:scale-95"
              >
                Đi tới Đăng nhập
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
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
