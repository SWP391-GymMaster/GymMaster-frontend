"use client"

import Link from "next/link"
import { ArrowLeft, LayoutDashboard, LockKeyhole } from "lucide-react"

type PermissionDeniedProps = {
  dashboardPath?: string
}

export function PermissionDenied({ dashboardPath }: PermissionDeniedProps) {
  return (
    <section className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden bg-[#f9f9ff] px-6 py-12 text-center text-[#191b23]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#c2c6d6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-[#c2c6d6]/70 bg-white/85 p-8 shadow-[0_16px_60px_rgba(25,27,35,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-[#ffdad6]">
          <LockKeyhole aria-hidden="true" className="size-10 text-[#ba1a1a]" />
        </div>
        <div className="mb-4 inline-flex rounded-full border border-[#c2c6d6]/60 bg-[#f2f3fd] px-3 py-1 text-sm font-semibold text-[#595e6d]">
          Access restricted
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#191b23] md:text-5xl">
          You do not have access to this workspace.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#424754]">
          Your account is signed in, but this area belongs to another role.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#727785] bg-white px-5 text-sm font-semibold text-[#191b23] transition hover:bg-[#f2f3fd] active:scale-[0.98]"
            type="button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Go back
          </button>
          {dashboardPath ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0058be] px-5 text-sm font-semibold text-white transition hover:bg-[#2170e4] active:scale-[0.98]"
              href={dashboardPath}
            >
              <LayoutDashboard aria-hidden="true" className="size-4" />
              Back to my dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
