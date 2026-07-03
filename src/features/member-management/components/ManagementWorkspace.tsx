"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Badge,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserRound,
  UsersRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { StatusPill, type Status } from "@/components/data/StatusPill"
import { formatVnDate } from "@/lib/date/vn-time"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  useCreateManagedTrainer,
  useCreateManagedUser,
  useDeleteManagedMember,
  useDeleteManagedUser,
  useManagedMembers,
  useManagedTrainers,
  useManagedUsers,
  useResetManagedUserPassword,
  useUpdateManagedMember,
  useUpdateManagedTrainer,
  useUpdateManagedUser,
  useUpdateManagedUserStatus,
} from "@/features/member-management/api/member-management.queries"
import {
  createTrainerSchema,
  createUserSchema,
  updateTrainerSchema,
  updateUserSchema,
  type CreateTrainerFormValues,
  type CreateUserFormValues,
  type UpdateTrainerFormValues,
} from "@/features/member-management/schemas/member-management.schemas"
import type {
  CreateTrainerResult,
  ManagedMember,
  ManagedTrainer,
  ManagedUser,
} from "@/features/member-management/types/member-management.types"
import { mapMemberManagementError } from "@/features/member-management/utils/member-management-errors"
import { cn } from "@/lib/utils"

type ManagementMode = "members" | "users" | "staff" | "trainers"

type ManagementWorkspaceProps = {
  mode: ManagementMode
  detailBasePath?: string
  canDeleteMembers?: boolean
}

const surfaceClass =
  "gm-panel"
const inputClass =
  "gm-field min-h-11 w-full px-3 text-sm text-foreground transition placeholder:text-muted-foreground"
const labelClass =
  "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"

function toStatus(status: string): Status {
  if (
    status === "active" ||
    status === "pending" ||
    status === "expired" ||
    status === "locked"
  ) {
    return status
  }

  return "unknown"
}

function FormError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="text-sm font-medium text-destructive">{message}</p>
}

export function ManagementWorkspace({
  canDeleteMembers = false,
  detailBasePath,
  mode,
}: ManagementWorkspaceProps) {
  const [query, setQuery] = useState("")
  const isMembersMode = mode === "members"
  const isTrainersMode = mode === "trainers"
  const userRole = mode === "staff" ? "staff" : mode === "users" ? undefined : undefined
  const membersQuery = useManagedMembers(isMembersMode ? query : "")
  const usersQuery = useManagedUsers(
    userRole,
    mode === "users" || mode === "staff" ? query : "",
  )
  const trainersQuery = useManagedTrainers(isTrainersMode ? query : "")
  const activeQuery = isMembersMode
    ? membersQuery
    : isTrainersMode
      ? trainersQuery
      : usersQuery
  const total = activeQuery.data?.total ?? 0
  const error = activeQuery.error
    ? mapMemberManagementError(activeQuery.error)
    : null

  if (isMembersMode) {
    return (
      <MemberDirectoryTemplate
        canDeleteMembers={canDeleteMembers}
        detailBasePath={detailBasePath}
        error={error}
        isLoading={activeQuery.isLoading}
        members={membersQuery.data?.items ?? []}
        query={query}
        setQuery={setQuery}
        total={total}
      />
    )
  }

  if (mode === "staff") {
    return (
      <StaffDirectoryTemplate
        error={error}
        isLoading={activeQuery.isLoading}
        query={query}
        setQuery={setQuery}
        total={total}
        users={usersQuery.data?.items ?? []}
      />
    )
  }

  if (isTrainersMode) {
    return (
      <TrainerRosterTemplate
        error={error}
        isLoading={activeQuery.isLoading}
        query={query}
        setQuery={setQuery}
        total={total}
        trainers={trainersQuery.data?.items ?? []}
      />
    )
  }

  return (
    <UserRoleDirectoryTemplate
      error={error}
      isLoading={activeQuery.isLoading}
      query={query}
      setQuery={setQuery}
      total={total}
      users={usersQuery.data?.items ?? []}
    />
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function Field({
  children,
  error,
  label,
}: {
  children: ReactNode
  error?: string
  label: string
}) {
  return (
    <label className="grid gap-2">
      <span className={labelClass}>{label}</span>
      {children}
      <FormError message={error} />
    </label>
  )
}

function DirectoryMetricCard({
  helper,
  icon: Icon,
  label,
  tone = "primary",
  value,
}: {
  helper?: string
  icon: LucideIcon
  label: string
  tone?: "primary" | "success" | "warning" | "neutral"
  value: string
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
    warning: "bg-orange-500/10 text-orange-600",
    neutral: "bg-muted text-muted-foreground",
  }[tone]

  return (
    <div className="gm-panel relative overflow-hidden p-5">
      <div className="absolute -right-6 bottom-0 size-20 rounded-full bg-primary/5" />
      <div className="relative flex items-center gap-4">
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", toneClass)}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
    </div>
  )
}

function SearchToolbar({
  action,
  filterLabel = "Bá»™ lá»c",
  onSearch,
  placeholder,
  value,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
}: {
  action: ReactNode
  filterLabel?: string
  onSearch: (value: string) => void
  placeholder: string
  value: string
  statusFilter?: string
  onStatusFilterChange?: (value: string) => void
  statusOptions?: { value: string; label: string }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const activeOptionLabel = statusOptions?.find((opt) => opt.value === statusFilter)?.label

  return (
    <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative w-full sm:max-w-md">
        <span className="sr-only">Search records</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="gm-field min-h-11 w-full pl-11 pr-3 text-sm text-foreground transition placeholder:text-muted-foreground"
          data-testid="management-search-input"
          data-shortcut-search
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        {statusOptions && onStatusFilterChange ? (
          <div className="relative">
            <Button
              className={cn(
                "min-h-11 rounded-full border-border bg-[var(--surface-panel)] text-foreground hover:bg-muted active:scale-[0.98] w-full sm:w-auto",
                statusFilter && statusFilter !== "" ? "border-primary text-primary" : "",
              )}
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              variant="outline"
            >
              <Filter aria-hidden="true" className="size-4" />
              {activeOptionLabel ? `${filterLabel}: ${activeOptionLabel}` : filterLabel}
            </Button>

            {isOpen ? (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsOpen(false)}
                />
                <div className="gm-panel absolute right-0 z-40 mt-2 w-56 p-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="py-1">
                    <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Lá»c theo tráº¡ng thÃ¡i
                    </p>
                    {statusOptions.map((option) => {
                      const selected = statusFilter === option.value
                      return (
                        <button
                          className={cn(
                            "flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors active:scale-[0.99]",
                            selected
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-foreground hover:bg-muted",
                          )}
                          key={option.value}
                          onClick={() => {
                            onStatusFilterChange(option.value)
                            setIsOpen(false)
                          }}
                          type="button"
                        >
                          <span>{option.label}</span>
                          {selected ? (
                            <Check className="size-4 text-primary" />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <Button
            className="min-h-11 rounded-full border-border bg-[var(--surface-panel)] text-foreground hover:bg-muted active:scale-[0.98]"
            type="button"
            variant="outline"
          >
            <Filter aria-hidden="true" className="size-4" />
            {filterLabel}
          </Button>
        )}
        {action}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Members                                                                    */
/* -------------------------------------------------------------------------- */

function MemberDirectoryTemplate({
  canDeleteMembers,
  detailBasePath,
  error,
  isLoading,
  members,
  query,
  setQuery,
  total,
}: {
  canDeleteMembers: boolean
  detailBasePath?: string
  error: ReturnType<typeof mapMemberManagementError> | null
  isLoading: boolean
  members: ManagedMember[]
  query: string
  setQuery: (value: string) => void
  total: number
}) {
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const statusOptions = [
    { value: "", label: "Táº¥t cáº£" },
    { value: "active", label: "Hoáº¡t Ä‘á»™ng" },
    { value: "expired", label: "Háº¿t háº¡n" },
    { value: "pending", label: "Chá» kÃ­ch hoáº¡t" },
  ]

  const filteredMembers = useMemo(() => {
    if (!statusFilter) return members
    return members.filter((member) => member.status === statusFilter)
  }, [members, statusFilter])

  const selectedMember =
    filteredMembers.find((member) => member.id === selectedId) ?? filteredMembers[0] ?? null

  const activeMembers = members.filter((member) => member.status === "active").length
  const expiredMembers = members.filter((member) => member.status === "expired").length
  const pendingMembers = members.filter((member) => member.status === "pending").length

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <DirectoryMetricCard
          helper="Táº¥t cáº£ há»™i viÃªn"
          icon={UsersRound}
          label="Tá»•ng há»™i viÃªn"
          value={String(total)}
        />
        <DirectoryMetricCard
          helper="Äang hoáº¡t Ä‘á»™ng"
          icon={BadgeCheck}
          label="Hoáº¡t Ä‘á»™ng"
          tone="success"
          value={String(activeMembers)}
        />
        <DirectoryMetricCard
          helper="Cáº§n gia háº¡n"
          icon={Clock3}
          label="Háº¿t háº¡n"
          tone="warning"
          value={String(expiredMembers)}
        />
        <DirectoryMetricCard
          helper="Chá» hoÃ n táº¥t"
          icon={UserRound}
          label="Chá» kÃ­ch hoáº¡t"
          tone="neutral"
          value={String(pendingMembers)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className={cn(surfaceClass, "overflow-hidden")}>
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                CRM Há»™i viÃªn
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Danh sÃ¡ch há»™i viÃªn
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quáº£n lÃ½ há»“ sÆ¡, gÃ³i táº­p, tráº¡ng thÃ¡i vÃ  thao tÃ¡c nhanh cá»§a há»™i viÃªn.
              </p>
            </div>
          </div>

          {/* "Them hoi vien" da bo: hoi vien tu dang ky + mua goi de thanh member. */}
          <SearchToolbar
            action={null}
            onSearch={setQuery}
            placeholder="TÃ¬m há»™i viÃªn theo tÃªn, email, SÄT, mÃ£ há»™i viÃªn..."
            value={query}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={statusOptions}
          />

          <div>
            {isLoading ? (
              <StateBlock
                description="Äang táº£i dá»¯ liá»‡u tá»« há»‡ thá»‘ng..."
                title="Äang táº£i danh sÃ¡ch há»™i viÃªn..."
                tone="loading"
              />
            ) : null}
            {error ? (
              <StateBlock
                description="Vui lÃ²ng thá»­ láº¡i hoáº·c kiá»ƒm tra quyá»n cá»§a tÃ i khoáº£n."
                title={error.message}
                tone="error"
              />
            ) : null}
            {!isLoading && !error && filteredMembers.length === 0 ? (
              <StateBlock
                description="Táº¡o há»“ sÆ¡ má»›i hoáº·c Ä‘iá»u chá»‰nh bá»™ lá»c tÃ¬m kiáº¿m."
                title="KhÃ´ng tÃ¬m tháº¥y há»™i viÃªn."
                tone="empty"
              />
            ) : null}
            {filteredMembers.length > 0 ? (
              <MemberTable
                canDelete={canDeleteMembers}
                detailBasePath={detailBasePath}
                members={filteredMembers}
                onSelect={setSelectedId}
                selectedId={selectedMember?.id ?? null}
                total={total}
              />
            ) : null}
          </div>
        </section>

        <MemberPreviewPanel detailBasePath={detailBasePath} member={selectedMember} />
      </div>
    </section>
  )
}

function MemberTable({
  canDelete,
  detailBasePath,
  members,
  onSelect,
  selectedId,
  total,
}: {
  canDelete: boolean
  detailBasePath?: string
  members: ManagedMember[]
  onSelect: (id: number) => void
  selectedId: number | null
  total: number
}) {
  const updateMember = useUpdateManagedMember()
  const deleteMember = useDeleteManagedMember()

  async function markExpired(member: ManagedMember) {
    try {
      await updateMember.mutateAsync({
        memberId: member.id,
        input: { status: "expired" },
      })
      toast.success("ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i há»™i viÃªn")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function removeMember(member: ManagedMember) {
    try {
      await deleteMember.mutateAsync(member.id)
      toast.success("ÄÃ£ xÃ³a má»m há»™i viÃªn")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <div data-testid="management-member-list">
      <div className="overflow-hidden rounded-xl border-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Há»™i viÃªn", "MÃ£", "Tráº¡ng thÃ¡i", "Sá»‘ Ä‘iá»‡n thoáº¡i", "NgÃ y sinh", "Thao tÃ¡c"].map(
                  (heading) => (
                    <th
                      className={cn(
                        "px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
                        heading === "Thao tÃ¡c" ? "text-right" : "",
                      )}
                      key={heading}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {members.map((member) => {
                const selected = selectedId === member.id

                return (
                  <tr
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/40",
                      selected ? "bg-primary/5" : "",
                    )}
                    data-testid="staff-member-result"
                    key={member.id}
                    onClick={() => onSelect(member.id)}
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-primary/10 text-sm font-semibold text-primary">
                          {initials(member.fullName)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {member.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {member.memberCode}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusPill status={toStatus(member.status)} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {member.phone || "â€”"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {formatDateVi(member.dateOfBirth)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {detailBasePath ? (
                          <Button
                            asChild
                            className="rounded-lg border-border bg-card text-foreground hover:bg-muted"
                            onClick={(event) => event.stopPropagation()}
                            variant="outline"
                          >
                            <Link href={`${detailBasePath}/${member.id}`}>
                              Xem
                            </Link>
                          </Button>
                        ) : null}
                        <Button
                          className="rounded-lg border-border bg-card text-foreground hover:bg-muted"
                          disabled={updateMember.isPending}
                          onClick={(event) => {
                            event.stopPropagation()
                            markExpired(member)
                          }}
                          type="button"
                          variant="outline"
                        >
                          ÄÃ¡nh dáº¥u háº¿t háº¡n
                        </Button>
                        {canDelete ? (
                          <Button
                            className="rounded-lg"
                            data-testid="member-delete-button"
                            disabled={deleteMember.isPending}
                            onClick={(event) => {
                              event.stopPropagation()
                              removeMember(member)
                            }}
                            type="button"
                            variant="destructive"
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                            XÃ³a
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>
            Hiá»ƒn thá»‹ 1 Ä‘áº¿n {members.length} cá»§a {total} há»™i viÃªn
          </span>
          <div className="flex items-center gap-1">
            <Button className="size-8 rounded-md" disabled type="button" variant="ghost">
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              1
            </span>
            <Button className="size-8 rounded-md" type="button" variant="ghost">
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MemberPreviewPanel({
  detailBasePath,
  member,
}: {
  detailBasePath?: string
  member: ManagedMember | null
}) {
  if (!member) {
    return (
      <section className={cn(surfaceClass, "p-6")}>
        <StateBlock
          description="Táº¡o há»“ sÆ¡ má»›i hoáº·c chá»n má»™t há»™i viÃªn tá»« danh sÃ¡ch."
          title="ChÆ°a chá»n há»™i viÃªn"
          tone="empty"
        />
      </section>
    )
  }

  return (
    <aside className={cn(surfaceClass, "overflow-hidden")}>
      <div className="border-b border-border p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Há»“ sÆ¡ Há»™i viÃªn 360Â°
        </p>
        <h3 className="mt-1 text-xl font-semibold text-foreground">
          ThÃ´ng tin há»™i viÃªn
        </h3>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4">
          <span
            aria-label={`${member.fullName} avatar`}
            className={cn(
              "relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 bg-cover bg-center text-2xl font-semibold text-primary",
              member.avatarUrl ? "text-transparent" : "",
            )}
            data-testid="member-profile-avatar"
            role="img"
            style={member.avatarUrl ? { backgroundImage: `url(${member.avatarUrl})` } : undefined}
          >
            {member.avatarUrl ? null : initials(member.fullName)}
            <span
              className={cn(
                "absolute bottom-1 right-1 size-4 rounded-full border-2 border-card",
                member.status === "active" ? "bg-primary" : "bg-destructive",
              )}
            />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {member.fullName}
              </h3>
              <StatusPill status={toStatus(member.status)} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{member.memberCode}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <PreviewInfo icon={Mail} label="Email" value={member.email} />
          <PreviewInfo icon={Phone} label="Sá»‘ Ä‘iá»‡n thoáº¡i" value={member.phone} />
          <PreviewInfo icon={CalendarDays} label="NgÃ y sinh" value={formatDateVi(member.dateOfBirth)} />
          <PreviewInfo icon={UserRound} label="Giá»›i tÃ­nh" value={formatGenderVi(member.gender)} />
          <PreviewInfo icon={Badge} label="Äá»‹a chá»‰" value={member.address} />
          <PreviewInfo icon={ShieldCheck} label="LiÃªn há»‡ kháº©n cáº¥p" value={member.emergencyContact} />
        </div>

        {detailBasePath ? (
          <div className="mt-5">
            <Button asChild className="min-h-11 w-full rounded-xl" variant="outline">
              <Link href={`${detailBasePath}/${member.id}`}>Xem chi tiáº¿t</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}

function PreviewInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value?: string
}) {
  return (
    <div className="gm-panel-muted flex items-center gap-3 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">
          {value || "ChÆ°a cáº­p nháº­t"}
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Staff                                                                      */
/* -------------------------------------------------------------------------- */

function StaffDirectoryTemplate({
  error,
  isLoading,
  query,
  setQuery,
  total,
  users,
}: {
  error: ReturnType<typeof mapMemberManagementError> | null
  isLoading: boolean
  query: string
  setQuery: (value: string) => void
  total: number
  users: ManagedUser[]
}) {
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const statusOptions = [
    { value: "", label: "Táº¥t cáº£" },
    { value: "active", label: "Hoáº¡t Ä‘á»™ng" },
    { value: "locked", label: "ÄÃ£ khÃ³a" },
  ]

  const filteredStaff = useMemo(() => {
    if (!statusFilter) return users
    return users.filter((user) => user.status === statusFilter)
  }, [users, statusFilter])

  const selectedStaff =
    filteredStaff.find((user) => user.userId === selectedId) ?? filteredStaff[0] ?? null

  const activeStaff = users.filter((user) => user.status === "active").length
  const lockedStaff = users.filter((user) => user.status === "locked").length

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DirectoryMetricCard
          helper="Táº¥t cáº£ nhÃ¢n sá»±"
          icon={UsersRound}
          label="Tá»•ng nhÃ¢n sá»±"
          value={String(total)}
        />
        <DirectoryMetricCard
          helper="Sáºµn sÃ ng váº­n hÃ nh"
          icon={UserCheck}
          label="Hoáº¡t Ä‘á»™ng"
          tone="success"
          value={String(activeStaff)}
        />
        <DirectoryMetricCard
          helper="TÃ i khoáº£n bá»‹ khÃ³a"
          icon={ShieldCheck}
          label="ÄÃ£ khÃ³a"
          tone="warning"
          value={String(lockedStaff)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.92fr)_minmax(0,1.08fr)]">
        <section className={cn(surfaceClass, "overflow-hidden")}>
          <div className="border-b border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Äá»™i ngÅ© Lá»… tÃ¢n
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Quáº£n lÃ½ nhÃ¢n sá»±
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dÃµi thÃ´ng tin tÃ i khoáº£n vÃ  tráº¡ng thÃ¡i váº­n hÃ nh cá»§a nhÃ¢n sá»±.
            </p>
          </div>

          <SearchToolbar
            action={<CreateUserDialog fixedRole="staff" label="ThÃªm nhÃ¢n sá»±" title="Táº¡o tÃ i khoáº£n nhÃ¢n sá»±" />}
            onSearch={setQuery}
            placeholder="TÃ¬m nhÃ¢n sá»± theo tÃªn, email, SÄT..."
            value={query}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={statusOptions}
          />

          <div className="space-y-2 p-3">
            <ManagementStateBlock
              emptyTitle="KhÃ´ng tÃ¬m tháº¥y nhÃ¢n sá»±."
              error={error}
              isLoading={isLoading}
              itemCount={filteredStaff.length}
              loadingTitle="Äang táº£i danh sÃ¡ch nhÃ¢n sá»±..."
            />
            {filteredStaff.map((user) => {
              const active = selectedStaff?.userId === user.userId

              return (
                <button
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 active:scale-[0.99]",
                    active
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-transparent hover:border-border hover:bg-muted/40",
                  )}
                  key={user.userId}
                  onClick={() => setSelectedId(user.userId)}
                  type="button"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {initials(user.fullName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {user.fullName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      NhÃ¢n viÃªn Lá»… tÃ¢n
                    </span>
                    {user.initialPassword ? (
                      <span className="mt-1 block truncate font-mono text-[11px] font-semibold text-primary">
                        Máº­t kháº©u táº¡m thá»i: {user.initialPassword}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      user.status === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {user.status === "active" ? "Hoáº¡t Ä‘á»™ng" : "ÄÃ£ khÃ³a"}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <StaffProfilePanel user={selectedStaff} />
      </div>
    </section>
  )
}

function StaffProfilePanel({ user: selectedUser }: { user: ManagedUser | null }) {
  const updateStatus = useUpdateManagedUserStatus()
  const resetPassword = useResetManagedUserPassword()
  const deleteUser = useDeleteManagedUser()
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  if (!selectedUser) {
    return (
      <section className={cn(surfaceClass, "p-6")}>
        <StateBlock
          description="Tao tai khoan nhan su hoac dieu chinh bo loc tim kiem."
          title="Chua chon nhan su"
          tone="empty"
        />
      </section>
    )
  }

  const user = selectedUser

  async function toggleLock() {
    try {
      await updateStatus.mutateAsync({
        userId: user.userId,
        input: { status: user.status === "locked" ? "active" : "locked" },
      })
      toast.success(user.status === "locked" ? "Da mo khoa tai khoan" : "Da khoa tai khoan")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function resetStaffPassword() {
    try {
      const result = await resetPassword.mutateAsync(user.userId)
      setTemporaryPassword(result.temporaryPassword)
      toast.success("Da tao mat khau tam thoi")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function removeStaff() {
    if (!window.confirm("Xoa tai khoan nhan su nay?")) return
    try {
      await deleteUser.mutateAsync(user.userId)
      toast.success("Da xoa tai khoan nhan su")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <section className={cn(surfaceClass, "overflow-hidden")}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-muted/25 p-6">
        <div className="flex items-center gap-5">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {initials(user.fullName)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                {user.fullName}
              </h2>
              <StatusPill status={toStatus(user.status)} />
            </div>
            <p className="mt-1 text-sm font-medium text-primary">Le tan · #{user.userId}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {user.email} · {user.phone ?? "Chua co SDT"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-6">
        <div className="flex flex-wrap gap-2">
          <StaffEditDialog user={user} />
          <Button className="rounded-xl" onClick={toggleLock} type="button" variant="outline">
            {user.status === "locked" ? "Mo khoa" : "Khoa"}
          </Button>
          <Button className="rounded-xl" onClick={resetStaffPassword} type="button" variant="outline">
            Dat lai mat khau
          </Button>
          <Button className="rounded-xl" onClick={removeStaff} type="button" variant="destructive">
            Xoa
          </Button>
        </div>

        <section className="gm-panel-muted p-5">
          <p className="mb-5 text-sm font-semibold text-foreground">Thong tin tai khoan</p>
          <div className="grid gap-3">
            {[
              { label: "Email", value: user.email || "-" },
              { label: "So dien thoai", value: user.phone || "-" },
              { label: "Vai tro", value: "Le tan" },
              { label: "Trang thai", value: user.status === "active" ? "Hoat dong" : "Da khoa" },
              { label: "Ma nguoi dung", value: `#${user.userId}` },
              { label: "Ngay sinh", value: formatDateVi(user.dateOfBirth) },
              { label: "Gioi tinh", value: formatGenderVi(user.gender) },
              { label: "Dia chi", value: user.address || "-" },
              { label: "Lien he khan cap", value: user.emergencyContact || "-" },
            ].map((row) => (
              <div className="flex items-center justify-between gap-4 text-sm" key={row.label}>
                <span className="text-muted-foreground">{row.label}</span>
                <span className="max-w-[60%] truncate text-right font-semibold text-foreground">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          {user.initialPassword ? (
            <p className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 font-mono text-xs font-semibold text-primary">
              Mat khau tam thoi: {user.initialPassword}
            </p>
          ) : null}
          {temporaryPassword ? (
            <p className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 font-mono text-xs font-semibold text-primary">
              Mat khau tam thoi: {temporaryPassword}
            </p>
          ) : null}
        </section>
      </div>
    </section>
  )
}

function StaffEditDialog({ user }: { user: ManagedUser }) {
  const updateUser = useUpdateManagedUser()
  const [open, setOpen] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    values: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? "",
      dateOfBirth: toDateInputValue(user.dateOfBirth),
      gender: user.gender ?? "",
      address: user.address ?? "",
      emergencyContact: user.emergencyContact ?? "",
    },
  })

  async function onSubmit(values: {
    fullName: string
    email: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    address?: string
    emergencyContact?: string
  }) {
    try {
      await updateUser.mutateAsync({
        userId: user.userId,
        input: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          gender: values.gender || undefined,
          address: values.address || undefined,
          emergencyContact: values.emergencyContact || undefined,
        },
      })
      toast.success("Da cap nhat nhan su")
      setOpen(false)
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next) {
        reset({
          fullName: user.fullName,
          email: user.email,
          phone: user.phone ?? "",
          dateOfBirth: toDateInputValue(user.dateOfBirth),
          gender: user.gender ?? "",
          address: user.address ?? "",
          emergencyContact: user.emergencyContact ?? "",
        })
      }
    }}>
      <DialogTrigger asChild>
        <Button className="rounded-xl" type="button" variant="outline">Sua</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sua nhan su</DialogTitle>
          <DialogDescription>Cap nhat tai khoan va thong tin ca nhan.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.fullName?.message as string | undefined} label="Ho va ten">
              <Input className={inputClass} {...register("fullName")} />
            </Field>
            <Field error={errors.email?.message as string | undefined} label="Email">
              <Input className={inputClass} type="email" {...register("email")} />
            </Field>
            <Field label="So dien thoai">
              <Input className={inputClass} {...register("phone")} />
            </Field>
            <Field label="Ngay sinh">
              <Input className={inputClass} type="date" {...register("dateOfBirth")} />
            </Field>
            <Field label="Gioi tinh">
              <Input className={inputClass} {...register("gender")} />
            </Field>
            <Field label="Lien he khan cap">
              <Input className={inputClass} {...register("emergencyContact")} />
            </Field>
          </div>
          <Field label="Dia chi">
            <Input className={inputClass} {...register("address")} />
          </Field>
          <Button className="rounded-xl bg-primary text-primary-foreground" disabled={isSubmitting || updateUser.isPending} type="submit">
            Luu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* -------------------------------------------------------------------------- */
/* Trainers                                                                   */
/* -------------------------------------------------------------------------- */

function TrainerRosterTemplate({
  error,
  isLoading,
  query,
  setQuery,
  total,
  trainers,
}: {
  error: ReturnType<typeof mapMemberManagementError> | null
  isLoading: boolean
  query: string
  setQuery: (value: string) => void
  total: number
  trainers: ManagedTrainer[]
}) {
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const statusOptions = [
    { value: "", label: "Táº¥t cáº£" },
    { value: "active", label: "Hoáº¡t Ä‘á»™ng" },
    { value: "locked", label: "ÄÃ£ khÃ³a" },
  ]

  const filteredTrainers = useMemo(() => {
    if (!statusFilter) return trainers
    return trainers.filter((trainer) => trainer.status === statusFilter)
  }, [trainers, statusFilter])

  const selectedTrainer =
    filteredTrainers.find((trainer) => trainer.id === selectedId) ?? filteredTrainers[0] ?? null
  const activeTrainers = trainers.filter((trainer) => trainer.status === "active").length
  const lockedTrainers = trainers.filter((trainer) => trainer.status === "locked").length

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DirectoryMetricCard
          helper="Táº¥t cáº£ PT"
          icon={Dumbbell}
          label="Tá»•ng PT"
          tone="neutral"
          value={String(total)}
        />
        <DirectoryMetricCard
          helper="Sáºµn sÃ ng nháº­n lá»‹ch"
          icon={BadgeCheck}
          label="Hoáº¡t Ä‘á»™ng"
          tone="success"
          value={String(activeTrainers)}
        />
        <DirectoryMetricCard
          helper="TÃ i khoáº£n bá»‹ khÃ³a"
          icon={ShieldCheck}
          label="ÄÃ£ khÃ³a"
          tone="warning"
          value={String(lockedTrainers)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.92fr)_minmax(0,1.08fr)]">
        <section className={cn(surfaceClass, "overflow-hidden")}>
          <div className="border-b border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Danh sÃ¡ch PT
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Quáº£n lÃ½ huáº¥n luyá»‡n viÃªn
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dÃµi chuyÃªn mÃ´n vÃ  há»“ sÆ¡ cá»§a Ä‘á»™i ngÅ© PT.
            </p>
          </div>

          <SearchToolbar
            action={<CreateTrainerDialog />}
            onSearch={setQuery}
            placeholder="TÃ¬m PT theo tÃªn hoáº·c chuyÃªn mÃ´n..."
            value={query}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={statusOptions}
          />

          <div className="space-y-2 p-3">
            <ManagementStateBlock
              emptyTitle="KhÃ´ng tÃ¬m tháº¥y huáº¥n luyá»‡n viÃªn."
              error={error}
              isLoading={isLoading}
              itemCount={filteredTrainers.length}
              loadingTitle="Äang táº£i danh sÃ¡ch huáº¥n luyá»‡n viÃªn..."
            />
            {filteredTrainers.map((trainer) => {
              const active = selectedTrainer?.id === trainer.id

              return (
                <button
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all duration-200 hover:bg-muted/40 active:scale-[0.99]",
                    active ? "border-primary/30 bg-primary/5 shadow-sm" : "border-transparent",
                  )}
                  key={trainer.id}
                  onClick={() => setSelectedId(trainer.id)}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {initials(trainer.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {trainer.fullName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {trainer.specialty || "ChÆ°a cáº­p nháº­t chuyÃªn mÃ´n"}
                      </span>
                    </span>
                    <StatusPill status={toStatus(trainer.status)} />
                  </div>
                  {trainer.yearsOfExperience != null && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <BadgeCheck aria-hidden="true" className="size-3.5 text-primary" />
                      {trainer.yearsOfExperience} nÄƒm kinh nghiá»‡m
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <TrainerProfilePanel trainer={selectedTrainer} />
      </div>
    </section>
  )
}

function TrainerProfilePanel({ trainer: selectedTrainer }: { trainer: ManagedTrainer | null }) {
  const updateStatus = useUpdateManagedUserStatus()
  const resetPassword = useResetManagedUserPassword()
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  if (!selectedTrainer) {
    return (
      <section className={cn(surfaceClass, "p-6")}>
        <StateBlock
          description="Tao ho so PT hoac dieu chinh bo loc tim kiem."
          title="Chua chon PT"
          tone="empty"
        />
      </section>
    )
  }

  const trainer = selectedTrainer

  const infoRows = [
    { label: "Email", value: trainer.email || "-" },
    { label: "Chuyen mon", value: trainer.specialty || "Chua cap nhat" },
    {
      label: "Kinh nghiem",
      value: trainer.yearsOfExperience != null ? `${trainer.yearsOfExperience} nam` : "-",
    },
    { label: "Gioi tinh", value: formatGenderVi(trainer.gender) },
    { label: "Ngay sinh", value: formatDateVi(trainer.dateOfBirth) },
    { label: "Dia chi", value: trainer.address || "-" },
    { label: "Lien he khan cap", value: trainer.emergencyContact || "-" },
    { label: "Ngay tao ho so", value: formatDateVi(trainer.createdAt) },
  ]

  async function toggleLock() {
    try {
      await updateStatus.mutateAsync({
        userId: trainer.userId,
        input: { status: trainer.status === "locked" ? "active" : "locked" },
      })
      toast.success(trainer.status === "locked" ? "Da mo khoa tai khoan PT" : "Da khoa tai khoan PT")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function resetTrainerPassword() {
    try {
      const result = await resetPassword.mutateAsync(trainer.userId)
      setTemporaryPassword(result.temporaryPassword)
      toast.success("Da tao mat khau tam thoi")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <section className={cn(surfaceClass, "overflow-hidden")}>
      <div className="flex flex-wrap items-start gap-5 border-b border-border bg-muted/25 p-6">
        <span className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground shadow-sm">
          {initials(trainer.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              {trainer.fullName}
            </h2>
            <StatusPill status={toStatus(trainer.status)} />
          </div>
          <p className="mt-1 text-sm font-medium text-primary">
            {trainer.specialty || "Chua cap nhat chuyen mon"}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail aria-hidden="true" className="size-4" />
            <span className="truncate">{trainer.email || "-"}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TrainerEditDialog trainer={trainer} />
            <TrainerAccountDialog trainer={trainer} />
            <Button className="rounded-xl" onClick={toggleLock} type="button" variant="outline">
              {trainer.status === "locked" ? "Mo khoa" : "Khoa"}
            </Button>
            <Button className="rounded-xl" onClick={resetTrainerPassword} type="button" variant="outline">
              Dat lai mat khau
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-3 lg:grid-cols-2">
        <section className="gm-panel-muted p-5">
          <p className="mb-5 text-sm font-semibold text-foreground">Thong tin ho so</p>
          <div className="grid gap-3">
            {infoRows.map((row) => (
              <div className="flex items-center justify-between gap-4 text-sm" key={row.label}>
                <span className="text-muted-foreground">{row.label}</span>
                <span className="max-w-[60%] truncate text-right font-semibold text-foreground">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          {temporaryPassword ? (
            <p className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 font-mono text-xs font-semibold text-primary">
              Mat khau tam thoi: {temporaryPassword}
            </p>
          ) : null}
        </section>

        <section className="gm-panel-muted p-5">
          <p className="mb-5 text-sm font-semibold text-foreground">Gioi thieu</p>
          {trainer.bio ? (
            <p className="text-sm leading-6 text-muted-foreground">{trainer.bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chua co mo ta gioi thieu cho huan luyen vien nay.
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

function TrainerEditDialog({ trainer }: { trainer: ManagedTrainer }) {
  const updateTrainer = useUpdateManagedTrainer()
  const [open, setOpen] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<UpdateTrainerFormValues>({
    resolver: zodResolver(updateTrainerSchema),
    values: {
      specialty: trainer.specialty ?? "",
      gender: trainer.gender ?? "",
      dateOfBirth: toDateInputValue(trainer.dateOfBirth),
      yearsOfExperience: trainer.yearsOfExperience?.toString() ?? "",
      bio: trainer.bio ?? "",
      address: trainer.address ?? "",
      emergencyContact: trainer.emergencyContact ?? "",
    },
  })

  async function onSubmit(values: UpdateTrainerFormValues) {
    const yearsOfExperience = values.yearsOfExperience?.trim()
    try {
      await updateTrainer.mutateAsync({
        trainerId: trainer.id,
        input: {
          specialty: values.specialty.trim(),
          gender: values.gender?.trim() || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
          bio: values.bio?.trim() || undefined,
          address: values.address?.trim() || undefined,
          emergencyContact: values.emergencyContact?.trim() || undefined,
        },
      })
      toast.success("Da cap nhat ho so PT")
      setOpen(false)
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next) {
        reset({
          specialty: trainer.specialty ?? "",
          gender: trainer.gender ?? "",
          dateOfBirth: toDateInputValue(trainer.dateOfBirth),
          yearsOfExperience: trainer.yearsOfExperience?.toString() ?? "",
          bio: trainer.bio ?? "",
          address: trainer.address ?? "",
          emergencyContact: trainer.emergencyContact ?? "",
        })
      }
    }}>
      <DialogTrigger asChild>
        <Button data-testid="trainer-edit-open" className="rounded-xl" type="button" variant="outline">Sua ho so</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sua ho so PT</DialogTitle>
          <DialogDescription>Cap nhat chuyen mon va thong tin ca nhan cua PT.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.specialty?.message} label="Chuyen mon">
              <Input data-testid="trainer-edit-specialty" className={inputClass} {...register("specialty")} />
            </Field>
            <Field label="Gioi tinh">
              <Input className={inputClass} {...register("gender")} />
            </Field>
            <Field label="Ngay sinh">
              <Input className={inputClass} type="date" {...register("dateOfBirth")} />
            </Field>
            <Field error={errors.yearsOfExperience?.message} label="So nam kinh nghiem">
              <Input className={inputClass} min={0} type="number" {...register("yearsOfExperience")} />
            </Field>
            <Field label="Dia chi">
              <Input className={inputClass} {...register("address")} />
            </Field>
            <Field label="Lien he khan cap">
              <Input className={inputClass} {...register("emergencyContact")} />
            </Field>
          </div>
          <Field label="Gioi thieu">
            <textarea className="gm-field min-h-24 w-full resize-none px-3 py-2 text-sm text-foreground" {...register("bio")} />
          </Field>
          <Button data-testid="trainer-edit-submit" className="rounded-xl bg-primary text-primary-foreground" disabled={isSubmitting || updateTrainer.isPending} type="submit">
            Luu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TrainerAccountDialog({ trainer }: { trainer: ManagedTrainer }) {
  const updateUser = useUpdateManagedUser()
  const [open, setOpen] = useState(false)
  const { handleSubmit, register, reset } = useForm({
    values: {
      fullName: trainer.fullName,
      phone: "",
    },
  })

  async function onSubmit(values: { fullName: string; phone?: string }) {
    try {
      await updateUser.mutateAsync({
        userId: trainer.userId,
        input: {
          fullName: values.fullName,
          phone: values.phone || undefined,
        },
      })
      toast.success("Da cap nhat tai khoan PT")
      setOpen(false)
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next) reset({ fullName: trainer.fullName, phone: "" })
    }}>
      <DialogTrigger asChild>
        <Button className="rounded-xl" type="button" variant="outline">Sua tai khoan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sua tai khoan PT</DialogTitle>
          <DialogDescription>Cap nhat ten hien thi va so dien thoai tai khoan.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Ho va ten">
            <Input className={inputClass} {...register("fullName")} />
          </Field>
          <Field label="So dien thoai">
            <Input className={inputClass} {...register("phone")} />
          </Field>
          <Button className="rounded-xl bg-primary text-primary-foreground" type="submit">Luu</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
function formatGenderVi(gender?: string | null): string {
  if (!gender) return "â€”"
  const normalized = gender.trim().toLowerCase()
  if (normalized === "male" || normalized === "nam") return "Nam"
  if (normalized === "female" || normalized === "ná»¯" || normalized === "nu") return "Ná»¯"
  return gender
}

function formatDateVi(value?: string | null): string {
  if (!value) return "â€”"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "â€”"
  return formatVnDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function toDateInputValue(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

/* -------------------------------------------------------------------------- */
/* Generic Users                                                               */
/* -------------------------------------------------------------------------- */

function UserRoleDirectoryTemplate({
  error,
  isLoading,
  query,
  setQuery,
  total,
  users,
}: {
  error: ReturnType<typeof mapMemberManagementError> | null
  isLoading: boolean
  query: string
  setQuery: (value: string) => void
  total: number
  users: ManagedUser[]
}) {
  const [statusFilter, setStatusFilter] = useState("")

  const statusOptions = [
    { value: "", label: "Táº¥t cáº£" },
    { value: "active", label: "Hoáº¡t Ä‘á»™ng" },
    { value: "locked", label: "ÄÃ£ khÃ³a" },
  ]

  const filteredUsers = useMemo(() => {
    if (!statusFilter) return users
    return users.filter((user) => user.status === statusFilter)
  }, [users, statusFilter])

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DirectoryMetricCard
          helper="Táº¥t cáº£ tÃ i khoáº£n"
          icon={UsersRound}
          label="Báº£n ghi"
          value={String(total)}
        />
        <DirectoryMetricCard
          helper="/api/v1/users"
          icon={ShieldCheck}
          label="Há»£p Ä‘á»“ng"
          tone="neutral"
          value="NgÆ°á»i dÃ¹ng"
        />
        <DirectoryMetricCard
          // helper="Backend spec 002"
          icon={BadgeCheck}
          label="Nguá»“n"
          tone="success"
          value="Sáºµn sÃ ng"
        />
      </div>

      <div className={cn(surfaceClass, "overflow-hidden")}>
        <SearchToolbar
          action={<CreateUserDialog label="Táº¡o tÃ i khoáº£n" title="Táº¡o tÃ i khoáº£n há»‡ thá»‘ng" />}
          onSearch={setQuery}
          placeholder="TÃ¬m ngÆ°á»i dÃ¹ng theo tÃªn, email, sá»‘ Ä‘iá»‡n thoáº¡i hoáº·c vai trÃ²..."
          value={query}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
        />
        <div className="p-5">
          <ManagementStateBlock
            emptyTitle="KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n."
            error={error}
            isLoading={isLoading}
            itemCount={filteredUsers.length}
            loadingTitle="Äang táº£i danh sÃ¡ch quáº£n trá»‹..."
          />
          {filteredUsers.length > 0 ? <UserList users={filteredUsers} /> : null}
        </div>
      </div>
    </section>
  )
}

function UserList({ users }: { users: ManagedUser[] }) {
  return (
    <div className="grid gap-3" data-testid="management-user-list">
      {users.map((user) => (
        <article
          className="rounded-xl border border-border bg-muted/25 p-4"
          key={user.userId}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                {initials(user.fullName)}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{user.fullName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                {user.phone ? (
                  <p className="mt-1 text-sm text-muted-foreground">{user.phone}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <StatusPill label={user.role.toUpperCase()} status="assigned" />
              <StatusPill status={toStatus(user.status)} />
            </div>
          </div>
          {user.initialPassword ? (
            <p className="mt-3 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 font-mono text-xs text-foreground">
              Máº­t kháº©u táº¡m thá»i: {user.initialPassword}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}

function ManagementStateBlock({
  emptyTitle,
  error,
  isLoading,
  itemCount,
  loadingTitle,
}: {
  emptyTitle: string
  error: ReturnType<typeof mapMemberManagementError> | null
  isLoading: boolean
  itemCount: number
  loadingTitle: string
}) {
  if (isLoading) {
    return (
      <StateBlock
        description="Äang táº£i dá»¯ liá»‡u tá»« há»‡ thá»‘ng..."
        title={loadingTitle}
        tone="loading"
      />
    )
  }

  if (error) {
    return (
      <StateBlock
        description="Vui lÃ²ng thá»­ láº¡i hoáº·c kiá»ƒm tra quyá»n cá»§a tÃ i khoáº£n."
        title={error.message}
        tone="error"
      />
    )
  }

  if (itemCount === 0) {
    return (
      <StateBlock
        description="Táº¡o há»“ sÆ¡ má»›i hoáº·c Ä‘iá»u chá»‰nh bá»™ lá»c tÃ¬m kiáº¿m."
        title={emptyTitle}
        tone="empty"
      />
    )
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Create Dialogs & Forms                                                     */
/* -------------------------------------------------------------------------- */

function CreateUserDialog({
  fixedRole,
  label = "ThÃªm ngÆ°á»i dÃ¹ng",
  title = "Táº¡o tÃ i khoáº£n",
}: {
  fixedRole?: "staff"
  label?: string
  title?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]" data-testid="user-create-open">
          <UserPlus aria-hidden="true" className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl p-0">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Vai trÃ² Ä‘Æ°á»£c lÆ°u vÃ o há»“ sÆ¡ tÃ i khoáº£n. NgÆ°á»i dÃ¹ng khÃ´ng chá»n role á»Ÿ mÃ n Ä‘Äƒng nháº­p.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <CreateUserPanel fixedRole={fixedRole} onCreated={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateTrainerDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]">
          <UserPlus aria-hidden="true" className="size-4" />
          Them PT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl p-0">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle>Tao ho so PT</DialogTitle>
          <DialogDescription>
            Tao tai khoan dang nhap role PT va ho so huan luyen vien trong mot buoc.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <CreateTrainerPanel onCreated={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateUserPanel({
  fixedRole,
  onCreated,
}: {
  fixedRole?: "staff"
  onCreated?: () => void
}) {
  const createUser = useCreateManagedUser()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      phone: "",
      role: fixedRole ?? "staff",
    },
  })

  async function onSubmit(values: CreateUserFormValues) {
    try {
      await createUser.mutateAsync({
        ...values,
        role: fixedRole ?? values.role,
        password: values.password || undefined,
        phone: values.phone || undefined,
      })
      reset({ email: "", fullName: "", password: "", phone: "", role: fixedRole ?? "staff" })
      toast.success("ÄÃ£ táº¡o tÃ i khoáº£n ngÆ°á»i dÃ¹ng")
      onCreated?.()
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Field error={errors.fullName?.message} label="Há» vÃ  tÃªn">
        <Input className={inputClass} data-testid="user-create-name" {...register("fullName")} />
      </Field>
      <Field error={errors.email?.message} label="Email">
        <Input className={inputClass} data-testid="user-create-email" type="email" {...register("email")} />
      </Field>
      <Field label="Sá»‘ Ä‘iá»‡n thoáº¡i">
        <Input className={inputClass} data-testid="user-create-phone" {...register("phone")} />
      </Field>
      {!fixedRole ? (
        <Field error={errors.role?.message} label="Vai trÃ²">
          {/* Visually hidden native select for Playwright test compatibility & React Hook Form registration */}
          <select
            className="sr-only"
            data-testid="user-create-role"
            {...register("role")}
          >
            <option value="staff">Lá»… tÃ¢n</option>
            <option value="admin">Quan tri vien</option>
          </select>

          <Select
            value={watch("role")}
            onValueChange={(val: string) => setValue("role", val as "staff" | "admin", { shouldValidate: true })}
          >
            <SelectTrigger className="min-h-11 w-full bg-background border border-border rounded-xl px-3 text-sm text-foreground focus-visible:ring-primary/20 focus-visible:border-primary">
              <SelectValue placeholder="Chá»n vai trÃ²" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
              <SelectItem value="staff" className="focus:bg-white/5 focus:text-white">Lá»… tÃ¢n</SelectItem>
              <SelectItem value="admin" className="focus:bg-white/5 focus:text-white">Quan tri vien</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs leading-5 text-muted-foreground">Man nay chi tao tai khoan van hanh (Le tan/Quan tri vien). Hoi vien tao o man Hoi vien, PT tao o man Huan luyen vien.</p>
        </Field>
      ) : null}
      <Field error={errors.password?.message} label="Máº­t kháº©u">
        <Input className={inputClass} data-testid="user-create-password" placeholder="Äá»ƒ trá»‘ng Ä‘á»ƒ sá»­ dá»¥ng máº­t kháº©u táº¡m thá»i" type="password" {...register("password")} />
      </Field>
      <Button className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95" data-testid="user-create-submit" disabled={isSubmitting || createUser.isPending} type="submit">
        <Plus aria-hidden="true" className="size-4" />
        Táº¡o tÃ i khoáº£n
      </Button>
    </form>
  )
}

function CreateTrainerPanel({ onCreated }: { onCreated?: () => void }) {
  const createTrainer = useCreateManagedTrainer()
  const [showLinkExisting, setShowLinkExisting] = useState(false)
  const [createdTrainer, setCreatedTrainer] = useState<CreateTrainerResult | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateTrainerFormValues>({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: {
      bio: "",
      dateOfBirth: "",
      email: "",
      fullName: "",
      gender: "",
      address: "",
      emergencyContact: "",
      password: "",
      phone: "",
      specialty: "",
      userId: "",
      yearsOfExperience: "",
    },
  })

  function resetForAnotherTrainer() {
    reset({
      bio: "",
      dateOfBirth: "",
      email: "",
      fullName: "",
      gender: "",
      address: "",
      emergencyContact: "",
      password: "",
      phone: "",
      specialty: "",
      userId: "",
      yearsOfExperience: "",
    })
    setShowLinkExisting(false)
    setCreatedTrainer(null)
  }

  async function onSubmit(values: CreateTrainerFormValues) {
    const userId = values.userId?.trim()
    const yearsOfExperience = values.yearsOfExperience?.trim()
    const input = userId
      ? {
          specialty: values.specialty.trim(),
          bio: values.bio?.trim() || undefined,
          gender: values.gender?.trim() || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          address: values.address?.trim() || undefined,
          emergencyContact: values.emergencyContact?.trim() || undefined,
          yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
          userId: Number(userId),
        }
      : {
          fullName: values.fullName?.trim() || undefined,
          email: values.email?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          password: values.password || undefined,
          specialty: values.specialty.trim(),
          bio: values.bio?.trim() || undefined,
          gender: values.gender?.trim() || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          address: values.address?.trim() || undefined,
          emergencyContact: values.emergencyContact?.trim() || undefined,
          yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
        }

    try {
      const result = await createTrainer.mutateAsync(input)
      if (result.initialPassword) {
        setCreatedTrainer(result)
        return
      }

      resetForAnotherTrainer()
      toast.success("Da tao ho so PT")
      onCreated?.()
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  if (createdTrainer?.initialPassword) {
    return (
      <div className="grid gap-5">
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
          <h3 className="text-lg font-semibold text-foreground">Da tao tai khoan PT</h3>
          <p className="mt-2 text-sm text-muted-foreground">Email: {createdTrainer.trainer.email}</p>
          <p className="mt-3 rounded-lg border border-primary/20 bg-background px-3 py-2 font-mono text-sm font-semibold text-foreground">
            Mat khau tam thoi: {createdTrainer.initialPassword}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Gui mat khau nay cho PT va nhac ho doi mat khau sau lan dang nhap dau.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="rounded-xl" onClick={resetForAnotherTrainer} type="button" variant="outline">
            Tao PT khac
          </Button>
          <Button className="rounded-xl bg-primary text-primary-foreground" onClick={onCreated} type="button">
            Dong
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.fullName?.message} label="Ho va ten">
          <Input className={inputClass} data-testid="trainer-create-name" {...register("fullName")} />
        </Field>
        <Field error={errors.email?.message} label="Email">
          <Input className={inputClass} data-testid="trainer-create-email" type="email" {...register("email")} />
        </Field>
        <Field label="So dien thoai">
          <Input className={inputClass} {...register("phone")} />
        </Field>
        <Field error={errors.password?.message} label="Mat khau">
          <Input className={inputClass} placeholder="De trong de su dung mat khau tam thoi" type="password" {...register("password")} />
        </Field>
        <Field error={errors.specialty?.message} label="Chuyen mon">
          <Input className={inputClass} data-testid="trainer-create-specialty" {...register("specialty")} />
        </Field>
        <Field label="Gioi tinh">
          <Input className={inputClass} placeholder="Nam/Nu" {...register("gender")} />
        </Field>
        <Field label="Ngay sinh">
          <Input className={inputClass} type="date" {...register("dateOfBirth")} />
        </Field>
        <Field error={errors.yearsOfExperience?.message} label="So nam kinh nghiem">
          <Input className={inputClass} min={0} type="number" {...register("yearsOfExperience")} />
        </Field>
        <Field label="Dia chi">
          <Input className={inputClass} {...register("address")} />
        </Field>
        <Field label="Lien he khan cap">
          <Input className={inputClass} {...register("emergencyContact")} />
        </Field>
      </div>

      <Field label="Gioi thieu">
        <textarea
          className="gm-field min-h-24 w-full resize-none px-3 py-2 text-sm text-foreground transition placeholder:text-muted-foreground"
          {...register("bio")}
        />
      </Field>

      <div className="rounded-xl border border-border p-4">
        <button
          className="text-sm font-semibold text-primary"
          onClick={() => setShowLinkExisting((value) => !value)}
          type="button"
        >
          Lien ket tai khoan PT co san
        </button>
        {showLinkExisting ? (
          <div className="mt-4 grid gap-2">
            <Field label="ID nguoi dung">
              <Input className={inputClass} type="number" {...register("userId")} />
            </Field>
            <p className="text-xs leading-5 text-muted-foreground">
              Chi dung khi tai khoan role PT da ton tai tu truoc.
            </p>
          </div>
        ) : null}
      </div>

      <Button className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95" data-testid="trainer-create-submit" disabled={isSubmitting || createTrainer.isPending} type="submit">
        <Plus aria-hidden="true" className="size-4" />
        Tao ho so PT
      </Button>
    </form>
  )
}
