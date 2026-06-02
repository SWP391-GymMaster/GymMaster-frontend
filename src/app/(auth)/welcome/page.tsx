import Link from "next/link"
import { ArrowRight, Dumbbell } from "lucide-react"

import { gymMasterAssets } from "@/lib/gymmaster-assets"

export default function WelcomePage() {
  return (
    <main
      className="relative flex min-h-screen items-center overflow-hidden bg-zinc-950 px-4 py-8 text-white"
      style={{
        backgroundImage: `linear-gradient(105deg, rgba(24,24,27,0.96), rgba(24,24,27,0.78) 48%, rgba(24,24,27,0.28)), url(${gymMasterAssets.operationsCover})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[1fr_360px] md:items-end">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-14 rounded-[1.25rem] bg-contain bg-center bg-no-repeat shadow-xl"
              style={{ backgroundImage: `url(${gymMasterAssets.mark})` }}
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                GymMaster OS
              </p>
              <p className="text-sm text-zinc-300">Fitness operations</p>
            </div>
          </div>
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary backdrop-blur">
            Hệ thống sẵn sàng
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Chào mừng đến GymMaster OS
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-200 md:text-lg">
            Vận hành phòng gym theo vai trò cho lễ tân, PT, quản trị và hội viên.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-zinc-950 shadow-sm transition hover:brightness-95 hover:shadow-md active:scale-[0.98]"
              href="/login"
            >
              Bắt đầu
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15 active:scale-[0.98]"
              href="/signup"
            >
              Tạo tài khoản hội viên
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary text-zinc-950">
              <Dumbbell aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="font-semibold">Demo flow</p>
              <p className="text-sm text-zinc-300">Auth → Role workspace</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            <WelcomeMetric label="Luồng đăng nhập" value="Không chọn vai trò" />
            <WelcomeMetric label="Điều hướng" value="Theo tài khoản" />
            <WelcomeMetric label="Trạng thái demo" value="Sẵn sàng" />
          </div>
        </div>
      </section>
    </main>
  )
}

function WelcomeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-white/10 px-4 py-3 text-sm">
      <span className="text-zinc-300">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  )
}
