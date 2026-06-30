"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  CheckCircle2,
  Clock,
  Phone,
  ScanLine,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { StatusPill } from "@/components/data/StatusPill"
import {
  usePtAssignedMembers,
  usePtCreateCheckIn,
  usePtTodayCheckIns,
} from "@/features/pt-dashboard/api/pt-dashboard.queries"
import { ApiClientError } from "@/lib/api/http-client"
import { cn } from "@/lib/utils"
import { formatVnTime } from "@/lib/date/vn-time"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatTime(value: string) {
  return formatVnTime(value, { hour: "2-digit", minute: "2-digit" })
}

export function PtCheckInContent() {
  const [search, setSearch] = useState("")
  const [pendingId, setPendingId] = useState<number | null>(null)

  const membersQuery = usePtAssignedMembers()
  const todayQuery = usePtTodayCheckIns()
  const createCheckIn = usePtCreateCheckIn()

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data])
  const todayCheckIns = useMemo(() => todayQuery.data ?? [], [todayQuery.data])

  // memberId -> gio check-in dau tien hom nay (de hien badge "Da check-in").
  const checkedInToday = useMemo(() => {
    const map = new Map<number, string>()
    for (const record of todayCheckIns) {
      if (!map.has(record.memberId)) {
        map.set(record.memberId, record.checkInAt)
      }
    }
    return map
  }, [todayCheckIns])

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = query
      ? members.filter(
          (m) =>
            m.fullName.toLowerCase().includes(query) ||
            m.memberCode.toLowerCase().includes(query) ||
            (m.phone && m.phone.includes(query)) ||
            (m.email && m.email.toLowerCase().includes(query)),
        )
      : [...members]

    return result.sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"))
  }, [members, search])

  async function handleCheckIn(memberId: number, fullName: string) {
    setPendingId(memberId)
    try {
      await createCheckIn.mutateAsync(memberId)
      toast.success(`Đã check-in cho ${fullName}.`)
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Không thể check-in. Vui lòng thử lại."
      toast.error(message)
    } finally {
      setPendingId(null)
    }
  }

  // --- Error state (danh sach hoi vien khong tai duoc) ---
  if (membersQuery.error) {
    return (
      <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-6">
        <p className="text-sm font-medium text-destructive">
          {membersQuery.error instanceof Error
            ? membersQuery.error.message
            : "Không thể tải danh sách hội viên."}
        </p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-destructive px-5 text-sm font-medium text-destructive-foreground transition hover:brightness-95 active:scale-[0.97]"
          onClick={() => membersQuery.refetch()}
          type="button"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // --- Loading state ---
  if (membersQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full animate-pulse rounded-[1.5rem] bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                className="gm-panel h-24 animate-pulse"
                key={i}
              />
            ))}
          </div>
          <div className="gm-panel h-80 animate-pulse" />
        </div>
      </div>
    )
  }

  const checkedInCount = members.filter((m) => checkedInToday.has(m.id)).length

  return (
    <div className="space-y-6">
      {/* Terminal header */}
      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6 text-white shadow-xl shadow-zinc-950/20">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary">
              <ScanLine aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Terminal check-in PT
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Điểm danh học viên của bạn
              </h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-zinc-400">
                Chỉ những hội viên được admin phân công cho bạn mới xuất hiện ở đây.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <TerminalMetric label="Được phân công" value={String(members.length)} />
            <TerminalMetric label="Đã check-in" value={String(checkedInCount)} tone="primary" />
            <TerminalMetric
              label="Chưa vào"
              value={String(Math.max(members.length - checkedInCount, 0))}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-zinc-500"
          />
          <input
            className="min-h-13 w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-12 pr-5 text-base text-white outline-none transition placeholder:text-zinc-500 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, mã hội viên, số điện thoại..."
            type="search"
            value={search}
          />
        </div>
      </section>

      {/* Split: member list + coaching note */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Member list */}
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
              <Users className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 font-semibold text-foreground">
                Bạn chưa được phân công hội viên nào
              </p>
              <p className="mt-1 text-xs">
                Khi admin phân công học viên cho bạn, họ sẽ xuất hiện tại đây để check-in.
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
              <Search className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 font-semibold text-foreground">
                Không tìm thấy hội viên phù hợp
              </p>
              <p className="mt-1 text-xs">Vui lòng kiểm tra lại từ khóa tìm kiếm.</p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const checkInTime = checkedInToday.get(member.id)
              const isCheckedIn = Boolean(checkInTime)
              const isPending = pendingId === member.id && createCheckIn.isPending

              return (
                <div
                  className="gm-interactive-card group p-5"
                  key={member.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                        {initials(member.fullName)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-base font-bold text-foreground">
                            {member.fullName}
                          </h4>
                          <StatusPill status={member.status} />
                          {isCheckedIn ? <StatusPill status="checked-in" /> : null}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-mono text-zinc-400">{member.memberCode}</span>
                          {member.phone ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <a
                                className="flex items-center gap-1 hover:underline"
                                href={`tel:${member.phone}`}
                              >
                                <Phone className="size-3" />
                                {member.phone}
                              </a>
                            </>
                          ) : null}
                          {checkInTime ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 font-semibold text-[color:var(--status-info-text)]">
                                <Clock className="size-3" />
                                {formatTime(checkInTime)}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Check-in action */}
                    {isCheckedIn ? (
                      <span className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full bg-primary/10 px-5 text-sm font-bold text-primary sm:self-center">
                        <CheckCircle2 className="size-4" />
                        Đã check-in
                      </span>
                    ) : (
                      <button
                        className={cn(
                          "inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:brightness-95 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:self-center",
                        )}
                        disabled={isPending}
                        onClick={() => handleCheckIn(member.id, member.fullName)}
                        type="button"
                      >
                        <UserCheck className="size-4" />
                        {isPending ? "Đang check-in..." : "Check-in"}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right rail: summary + rules */}
        <div className="space-y-4">
          <div className="gm-panel p-5">
            <div className="flex items-center gap-2">
              <Activity className="size-4.5 text-primary" />
              <h4 className="text-sm font-bold text-foreground">Nhịp điểm danh hôm nay</h4>
            </div>
            <div className="mt-4 space-y-3 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Tổng được phân công</span>
                <span className="text-foreground">{members.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Đã vào phòng</span>
                <span className="font-bold text-primary">{checkedInCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chưa check-in</span>
                <span className="font-bold text-orange-500">
                  {Math.max(members.length - checkedInCount, 0)}
                </span>
              </div>
            </div>
            {todayQuery.isError ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Không tải được trạng thái hôm nay. Bạn vẫn có thể check-in bình thường.
              </p>
            ) : null}
          </div>

          <div className="gm-panel p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4.5 text-primary" />
              <h4 className="text-sm font-bold text-foreground">Lưu ý check-in</h4>
            </div>
            <ul className="mt-4 space-y-3 text-xs leading-5 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Bạn chỉ có thể check-in cho hội viên được phân công cho mình.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Hội viên cần có gói tập hợp lệ và tài khoản không bị khóa.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Hội viên vẫn có thể tự check-in hoặc qua quầy lễ tân như bình thường.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function TerminalMetric({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "primary"
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-black tracking-tight",
          tone === "primary" ? "text-primary" : "text-white",
        )}
      >
        {value}
      </p>
    </div>
  )
}
