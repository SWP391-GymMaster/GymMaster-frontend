"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  ArrowRight,
  ClipboardList,
  FileClock,
  Activity,
  Users,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  SlidersHorizontal,
} from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { usePtAssignedMembers } from "@/features/pt-dashboard/api/pt-dashboard.queries"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function PtMembersContent() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "expired">("all")
  const [sortBy, setSortBy] = useState<"name" | "code">("name")
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const { data, isLoading, error, refetch } = usePtAssignedMembers()
  const members = data ?? []

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Đã sao chép mã hội viên!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members]

    // 1. Search Query
    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (m) =>
          m.fullName.toLowerCase().includes(query) ||
          m.memberCode.toLowerCase().includes(query) ||
          (m.phone && m.phone.includes(query)) ||
          (m.email && m.email.toLowerCase().includes(query))
      )
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter)
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.fullName.localeCompare(b.fullName, "vi")
      } else {
        return a.memberCode.localeCompare(b.memberCode)
      }
    })

    return result
  }, [members, search, statusFilter, sortBy])

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-6">
        <p className="text-sm font-medium text-destructive">
          {error instanceof Error ? error.message : "Không thể tải danh sách hội viên."}
        </p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-destructive px-5 text-sm font-medium text-destructive-foreground transition hover:brightness-95 active:scale-[0.97]"
          onClick={() => refetch()}
          type="button"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                className="h-28 animate-pulse rounded-[1.5rem] border border-border bg-card p-5"
                key={i}
              />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-[1.5rem] border border-border bg-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search & Quick Filters Header */}
      <div className="rounded-[1.5rem] border border-border bg-card p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              className="pl-11"
              placeholder="Tìm theo tên, mã hội viên, số điện thoại..."
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>

          {/* Sort & Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <SlidersHorizontal className="size-3.5" />
              <span>Sắp xếp:</span>
            </div>
            
            <select
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "code")}
            >
              <option value="name">Tên hội viên (A-Z)</option>
              <option value="code">Mã hội viên</option>
            </select>

            <Select
              value={sortBy}
              onValueChange={(val: string) => setSortBy(val as "name" | "code")}
            >
              <SelectTrigger className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-primary/20 focus-visible:border-primary">
                <SelectValue placeholder="Chọn kiểu sắp xếp" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
                <SelectItem value="name" className="focus:bg-white/5 focus:text-white">Tên hội viên (A-Z)</SelectItem>
                <SelectItem value="code" className="focus:bg-white/5 focus:text-white">Mã hội viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-4">
          {(
            [
              { key: "all", label: "Tất cả", count: members.length },
              { key: "active", label: "Đang hoạt động", count: members.filter((m) => m.status === "active").length },
              { key: "pending", label: "Chờ kích hoạt", count: members.filter((m) => m.status === "pending").length },
              { key: "expired", label: "Hết hạn", count: members.filter((m) => m.status === "expired").length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              type="button"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold tracking-wide transition active:scale-[0.98]",
                statusFilter === tab.key
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {tab.label}
              <span className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                statusFilter === tab.key ? "bg-primary/20 text-primary" : "bg-muted-foreground/15 text-muted-foreground"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main split content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Side: Members List */}
        <div className="space-y-3">
          {filteredAndSortedMembers.length > 0 ? (
            filteredAndSortedMembers.map((member) => (
              <div
                key={member.id}
                className="group rounded-[1.5rem] border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Member basic details */}
                  <div className="flex items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                      {initials(member.fullName)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-foreground truncate max-w-[200px] sm:max-w-none">
                          {member.fullName}
                        </h4>
                        <StatusPill status={member.status} />
                      </div>
                      
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <button
                          onClick={() => handleCopy(member.memberCode, member.id)}
                          type="button"
                          className="flex items-center gap-1 hover:text-primary transition"
                        >
                          <span className="font-mono text-zinc-400 group-hover:text-zinc-300">
                            {member.memberCode}
                          </span>
                          {copiedId === member.id ? (
                            <Check className="size-3 text-primary" />
                          ) : (
                            <Copy className="size-3 opacity-60" />
                          )}
                        </button>
                        <span>·</span>
                        <a href={`tel:${member.phone}`} className="flex items-center gap-1 hover:underline">
                          <Phone className="size-3" />
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right side navigation CTA */}
                  <Link
                    href={`/pt/members/${member.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary px-4 transition self-start sm:self-center active:scale-[0.97]"
                  >
                    Hồ sơ 360
                    <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Sub-actions for fitness options */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/40 pt-4 sm:flex sm:items-center sm:gap-3">
                  <Link
                    href={`/pt/members/${member.id}/workout`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground px-4 transition active:scale-[0.98]"
                  >
                    <ClipboardList className="size-3.5 text-muted-foreground" />
                    Thiết lập giáo án
                  </Link>
                  <Link
                    href={`/pt/members/${member.id}/notes`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground px-4 transition active:scale-[0.98]"
                  >
                    <FileClock className="size-3.5 text-muted-foreground" />
                    Ghi chú HLV
                  </Link>
                  <Link
                    href={`/pt/members/${member.id}/progress`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground px-4 transition active:scale-[0.98] col-span-2 sm:col-span-1"
                  >
                    <Activity className="size-3.5 text-muted-foreground" />
                    Chỉ số PT
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
              <Users className="size-8 mx-auto text-muted-foreground/40" />
              <p className="mt-3 font-semibold text-foreground">Không tìm thấy hội viên nào</p>
              <p className="text-xs mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
            </div>
          )}
        </div>

        {/* Right Side: Quick info & PT coaching guidelines */}
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
            <h4 className="font-bold text-sm text-foreground">Tóm tắt danh sách</h4>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Tổng hội viên:</span>
                <span className="text-foreground">{members.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Đang tập luyện:</span>
                <span className="text-emerald-500 font-bold">
                  {members.filter((m) => m.status === "active").length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Chờ kích hoạt:</span>
                <span className="text-orange-500 font-bold">
                  {members.filter((m) => m.status === "pending").length}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4.5 text-primary" />
              <h4 className="font-bold text-sm text-foreground">Quy chuẩn Huấn luyện</h4>
            </div>
            <ul className="mt-4 space-y-3 text-xs leading-5 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Kiểm tra chỉ số đo thể trạng và BMI của học viên định kỳ mỗi tháng.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Thiết lập giáo án buổi tập chi tiết, ghi nhận đúng số hiệp/reps thực tế.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Lưu Trainer Notes trong vòng 24 giờ sau buổi tập để học viên theo dõi tiến độ.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
