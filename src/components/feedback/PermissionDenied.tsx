import Link from "next/link"

type PermissionDeniedProps = {
  dashboardPath?: string
}

export function PermissionDenied({ dashboardPath }: PermissionDeniedProps) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
        Access restricted
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          You do not have access to this workspace.
        </h1>
        <p className="text-base leading-7 text-zinc-600">
          Your account is signed in, but this area belongs to another role.
        </p>
      </div>
      {dashboardPath ? (
        <Link
          className="inline-flex min-h-11 items-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.97]"
          href={dashboardPath}
        >
          Back to my dashboard
        </Link>
      ) : null}
    </section>
  )
}
