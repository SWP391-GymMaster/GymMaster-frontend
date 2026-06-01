import Link from "next/link"

import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[linear-gradient(135deg,#f8fafc,#ffffff_45%,#ecfdf5)] text-zinc-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center px-5 py-8 md:px-10">
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur md:p-8">
          <div className="mb-8 space-y-3">
            <Link
              className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700"
              href="/welcome"
            >
              GymMaster
            </Link>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                Sign in
              </h1>
              <p className="mt-3 text-base leading-7 text-zinc-600">
                Use your GymMaster account. Your workspace opens from your
                authenticated role.
              </p>
            </div>
          </div>
          <LoginForm />
        </div>
      </section>

      <section className="hidden min-h-screen items-end bg-zinc-950 p-8 text-white lg:flex">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">
            Secure role redirect
          </p>
          <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-tight">
            No role picker. The backend determines your workspace.
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-zinc-400">Login flow</p>
              <p className="mt-3 text-xl font-semibold">Email + password</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-zinc-400">Route source</p>
              <p className="mt-3 text-xl font-semibold">Authenticated role</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
