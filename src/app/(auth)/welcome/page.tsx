import Link from "next/link"

export default function WelcomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.22),transparent_28%),linear-gradient(135deg,#fafafa,#eef2ff_48%,#f0fdf4)] px-5 py-6 text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-between gap-10">
        <header className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            GymMaster
          </span>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-zinc-200 bg-white/70 px-5 text-sm font-medium text-zinc-900 backdrop-blur transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white active:scale-[0.97]"
            href="/login"
          >
            Sign in
          </Link>
        </header>

        <section className="grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur">
              Premium fitness operations workspace
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
                Gym operations, coaching, and member progress in one focused
                frontend.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-600">
                Sign in once. GymMaster identifies your account role from the
                backend and opens the right workspace automatically.
              </p>
            </div>
            <Link
              className="inline-flex min-h-14 items-center rounded-full bg-zinc-950 px-7 text-base font-medium text-white shadow-xl shadow-zinc-950/15 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.97]"
              href="/login"
            >
              Continue to login
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-zinc-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <span className="text-sm text-zinc-400">Today</span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-200">
                Role aware
              </span>
            </div>
            <div className="grid gap-4 py-6">
              <div>
                <p className="text-sm text-zinc-400">Check-ins</p>
                <p className="mt-2 text-5xl font-semibold">128</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-zinc-400">Active plans</p>
                  <p className="mt-3 text-2xl font-semibold">42</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-zinc-400">PT notes</p>
                  <p className="mt-3 text-2xl font-semibold">18</p>
                </div>
              </div>
            </div>
            <p className="text-sm leading-6 text-zinc-400">
              MVP shell only: full role workflows are implemented in later
              slices.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
