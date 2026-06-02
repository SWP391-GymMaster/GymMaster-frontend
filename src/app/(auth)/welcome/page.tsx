import Link from "next/link"
import { ArrowRight, Dumbbell } from "lucide-react"

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f9f9ff] px-4 py-8 text-[#191b23]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-28 h-[28rem] w-[28rem] rounded-full bg-[#dee2f4]/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#c2c6d6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      <section className="relative z-10 w-full max-w-[640px] rounded-xl border border-[#e1e2ec] bg-white/85 p-6 text-center shadow-[0_20px_80px_rgba(25,27,35,0.08)] backdrop-blur-xl md:p-12">
        <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-primary text-white shadow-lg">
          <Dumbbell aria-hidden="true" className="size-10" />
        </div>
        <div className="mx-auto mb-4 inline-flex rounded-full border border-[#c2c6d6]/60 bg-[#f2f3fd] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Hệ thống sẵn sàng
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#191b23] md:text-5xl">
          Chào mừng đến GymMaster OS
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#424754] md:text-lg">
          Vận hành phòng gym theo vai trò cho lễ tân, PT, quản trị và hội viên.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm transition hover:brightness-95 hover:shadow-md active:scale-[0.98]"
            href="/login"
          >
            Bắt đầu
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#c2c6d6] bg-white px-6 text-base font-semibold text-[#191b23] transition hover:bg-[#f2f3fd] active:scale-[0.98]"
            href="/signup"
          >
            Tạo tài khoản hội viên
          </Link>
        </div>
      </section>
    </main>
  )
}
