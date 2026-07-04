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
import { genderLabel, toCanonicalGender } from "@/lib/validation/person"
import { StateBlock } from "@/components/feedback/StateBlock"
import { DateOfBirthField } from "@/components/forms/DateOfBirthField"
import { GenderSelect } from "@/components/forms/GenderSelect"
import { PhoneField } from "@/components/forms/PhoneField"
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
  updateMemberSchema,
  updateTrainerSchema,
  updateUserSchema,
  type CreateTrainerFormValues,
  type CreateUserFormValues,
  type UpdateMemberFormValues,
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
  filterLabel = "Bộ lọc",
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
                      Lọc theo trạng thái
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
    { value: "", label: "Tất cả" },
    { value: "active", label: "Hoạt động" },
    { value: "expired", label: "Hết hạn" },
    { value: "pending", label: "Chờ kích hoạt" },
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
          helper="Tất cả hội viên"
          icon={UsersRound}
          label="Tổng hội viên"
          value={String(total)}
        />
        <DirectoryMetricCard
          helper="Đang hoạt động"
          icon={BadgeCheck}
          label="Hoạt động"
          tone="success"
          value={String(activeMembers)}
        />
        <DirectoryMetricCard
          helper="Cần gia hạn"
          icon={Clock3}
          label="Hết hạn"
          tone="warning"
          value={String(expiredMembers)}
        />
        <DirectoryMetricCard
          helper="Chờ hoàn tất"
          icon={UserRound}
          label="Chờ kích hoạt"
          tone="neutral"
          value={String(pendingMembers)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className={cn(surfaceClass, "overflow-hidden")}>
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                CRM Hội viên
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Danh sách hội viên
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quản lý hồ sơ, gói tập, trạng thái và thao tác nhanh của hội viên.
              </p>
            </div>
          </div>

          {/* "Thêm hoi vien" da bo: hoi vien tu dang ky + mua goi de thanh member. */}
          <SearchToolbar
            action={null}
            onSearch={setQuery}
            placeholder="Tìm hội viên theo tên, email, SĐT, mã hội viên..."
            value={query}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={statusOptions}
          />

          <div>
            {isLoading ? (
              <StateBlock
                description="Đang tải dữ liệu từ hệ thống..."
                title="Đang tải danh sách hội viên..."
                tone="loading"
              />
            ) : null}
            {error ? (
              <StateBlock
                description="Vui lòng thử lại hoặc kiểm tra quyền của tài khoản."
                title={error.message}
                tone="error"
              />
            ) : null}
            {!isLoading && !error && filteredMembers.length === 0 ? (
              <StateBlock
                description="Tạo hồ sơ mới hoặc điều chỉnh bộ lọc tìm kiếm."
                title="Không tìm thấy hội viên."
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
  const deleteMember = useDeleteManagedMember()

  async function removeMember(member: ManagedMember) {
    try {
      await deleteMember.mutateAsync(member.id)
      toast.success("Đã xóa mềm hội viên")
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
                {["Hội viên", "Mã", "Trạng thái", "Số điện thoại", "Ngày sinh", "Thao tác"].map(
                  (heading) => (
                    <th
                      className={cn(
                        "px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
                        heading === "Thao tác" ? "text-right" : "",
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
                      {member.phone || "—"}
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
                        <MemberEditDialog member={member} />
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
                            Xóa
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
            Hiển thị 1 đến {members.length} của {total} hội viên
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
          description="Tạo hồ sơ mới hoặc chọn một hội viên từ danh sách."
          title="Chưa chọn hội viên"
          tone="empty"
        />
      </section>
    )
  }

  return (
    <aside className={cn(surfaceClass, "overflow-hidden")}>
      <div className="border-b border-border p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Hồ sơ Hội viên 360°
        </p>
        <h3 className="mt-1 text-xl font-semibold text-foreground">
          Thông tin hội viên
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
          <PreviewInfo icon={Phone} label="Số điện thoại" value={member.phone} />
          <PreviewInfo icon={CalendarDays} label="Ngày sinh" value={formatDateVi(member.dateOfBirth)} />
          <PreviewInfo icon={UserRound} label="Giới tính" value={formatGenderVi(member.gender)} />
          <PreviewInfo icon={Badge} label="Địa chỉ" value={member.address} />
          <PreviewInfo icon={ShieldCheck} label="Liên hệ khẩn cấp" value={member.emergencyContact} />
        </div>

        {detailBasePath ? (
          <div className="mt-5">
            <Button asChild className="min-h-11 w-full rounded-xl" variant="outline">
              <Link href={`${detailBasePath}/${member.id}`}>Xem chi tiết</Link>
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
          {value || "Chưa cập nhật"}
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
    { value: "", label: "Tất cả" },
    { value: "active", label: "Hoạt động" },
    { value: "locked", label: "Đã khóa" },
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
          helper="Tất cả nhân sự"
          icon={UsersRound}
          label="Tổng nhân sự"
          value={String(total)}
        />
        <DirectoryMetricCard
          helper="Sẵn sàng vận hành"
          icon={UserCheck}
          label="Hoạt động"
          tone="success"
          value={String(activeStaff)}
        />
        <DirectoryMetricCard
          helper="Tài khoản bị khóa"
          icon={ShieldCheck}
          label="Đã khóa"
          tone="warning"
          value={String(lockedStaff)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.92fr)_minmax(0,1.08fr)]">
        <section className={cn(surfaceClass, "overflow-hidden")}>
          <div className="border-b border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Đội ngũ Lễ tân
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Quản lý nhân sự
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi thông tin tài khoản và trạng thái vận hành của nhân sự.
            </p>
          </div>

          <SearchToolbar
            action={<CreateUserDialog fixedRole="staff" label="Thêm nhân sự" title="Tạo tài khoản nhân sự" />}
            onSearch={setQuery}
            placeholder="Tìm nhân sự theo tên, email, SĐT..."
            value={query}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={statusOptions}
          />

          <div className="space-y-2 p-3">
            <ManagementStateBlock
              emptyTitle="Không tìm thấy nhân sự."
              error={error}
              isLoading={isLoading}
              itemCount={filteredStaff.length}
              loadingTitle="Đang tải danh sách nhân sự..."
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
                      Nhân viên Lễ tân
                    </span>
                    {user.initialPassword ? (
                      <span className="mt-1 block truncate font-mono text-[11px] font-semibold text-primary">
                        Mật khẩu tạm thời: {user.initialPassword}
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
                    {user.status === "active" ? "Hoạt động" : "Đã khóa"}
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
          description="Tạo tài khoản nhân sự hoặc điều chỉnh bộ lọc tìm kiếm."
          title="Chưa chọn nhân sự"
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
      toast.success(user.status === "locked" ? "Đã mo khoa tài khoản" : "Đã khóa tài khoản")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function resetStaffPassword() {
    try {
      const result = await resetPassword.mutateAsync(user.userId)
      setTemporaryPassword(result.temporaryPassword)
      toast.success("Đã tạo mật khẩu tạm thời")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function removeStaff() {
    if (!window.confirm("Xóa tài khoản nhân sự này?")) return
    try {
      await deleteUser.mutateAsync(user.userId)
      toast.success("Đã xóa tài khoản nhân sự")
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
            <p className="mt-1 text-sm font-medium text-primary">Lễ tân · #{user.userId}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {user.email} · {user.phone ?? "Chưa có SĐT"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-6">
        <div className="flex flex-wrap gap-2">
          <StaffEditDialog user={user} />
          <Button className="rounded-xl" onClick={toggleLock} type="button" variant="outline">
            {user.status === "locked" ? "Mở khóa" : "Khóa"}
          </Button>
          <Button className="rounded-xl" onClick={resetStaffPassword} type="button" variant="outline">
            Đặt lại mật khẩu
          </Button>
          <Button className="rounded-xl" onClick={removeStaff} type="button" variant="destructive">
            Xóa
          </Button>
        </div>

        <section className="gm-panel-muted p-5">
          <p className="mb-5 text-sm font-semibold text-foreground">Thông tin tài khoản</p>
          <div className="grid gap-3">
            {[
              { label: "Email", value: user.email || "-" },
              { label: "Số điện thoại", value: user.phone || "-" },
              { label: "Vai trò", value: "Lễ tân" },
              { label: "Trạng thái", value: user.status === "active" ? "Hoạt động" : "Đã khóa" },
              { label: "Mã người dùng", value: `#${user.userId}` },
              { label: "Ngày sinh", value: formatDateVi(user.dateOfBirth) },
              { label: "Giới tính", value: formatGenderVi(user.gender) },
              { label: "Địa chỉ", value: user.address || "-" },
              { label: "Liên hệ khẩn cấp", value: user.emergencyContact || "-" },
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
              Mật khẩu tạm thời: {user.initialPassword}
            </p>
          ) : null}
          {temporaryPassword ? (
            <p className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 font-mono text-xs font-semibold text-primary">
              Mật khẩu tạm thời: {temporaryPassword}
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
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    values: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? "",
      dateOfBirth: toDateInputValue(user.dateOfBirth),
      gender: toCanonicalGender(user.gender),
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
      toast.success("Đã cập nhật nhân sự")
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
          gender: toCanonicalGender(user.gender),
          address: user.address ?? "",
          emergencyContact: user.emergencyContact ?? "",
        })
      }
    }}>
      <DialogTrigger asChild>
        <Button className="rounded-xl" type="button" variant="outline">Sửa</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sửa nhân sự</DialogTitle>
          <DialogDescription>Cập nhật tài khoản và thông tin cá nhân.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.fullName?.message as string | undefined} label="Họ và tên">
              <Input className={inputClass} {...register("fullName")} />
            </Field>
            <Field error={errors.email?.message as string | undefined} label="Email">
              <Input className={inputClass} type="email" {...register("email")} />
            </Field>
            <Field error={errors.phone?.message as string | undefined} label="Số điện thoại">
              <PhoneField className={inputClass} {...register("phone")} />
            </Field>
            <Field error={errors.dateOfBirth?.message as string | undefined} label="Ngày sinh">
              <DateOfBirthField className={inputClass} {...register("dateOfBirth")} />
            </Field>
            <Field label="Giới tính">
              <GenderSelect
                onChange={(value) => setValue("gender", value, { shouldValidate: true, shouldDirty: true })}
                value={watch("gender")}
              />
            </Field>
            <Field error={errors.emergencyContact?.message as string | undefined} label="Liên hệ khẩn cấp">
              <Input className={inputClass} {...register("emergencyContact")} />
            </Field>
          </div>
          <Field error={errors.address?.message as string | undefined} label="Địa chỉ">
            <Input className={inputClass} {...register("address")} />
          </Field>
          <Button className="rounded-xl bg-primary text-primary-foreground" disabled={isSubmitting || updateUser.isPending} type="submit">
            Lưu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
// Admin sua ho so ca nhan hoi vien ngay tai cua Members (email read-only).
function MemberEditDialog({ member }: { member: ManagedMember }) {
  const updateMember = useUpdateManagedMember()
  const [open, setOpen] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberSchema),
    values: {
      fullName: member.fullName,
      phone: member.phone ?? "",
      dateOfBirth: toDateInputValue(member.dateOfBirth),
      gender: toCanonicalGender(member.gender),
      address: member.address ?? "",
      emergencyContact: member.emergencyContact ?? "",
    },
  })

  async function onSubmit(values: UpdateMemberFormValues) {
    try {
      await updateMember.mutateAsync({
        memberId: member.id,
        input: {
          fullName: values.fullName,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth || undefined,
          gender: values.gender || undefined,
          address: values.address || undefined,
          emergencyContact: values.emergencyContact || undefined,
        },
      })
      toast.success("Đã cập nhật hồ sơ hội viên")
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
          fullName: member.fullName,
          phone: member.phone ?? "",
          dateOfBirth: toDateInputValue(member.dateOfBirth),
          gender: toCanonicalGender(member.gender),
          address: member.address ?? "",
          emergencyContact: member.emergencyContact ?? "",
        })
      }
    }}>
      <DialogTrigger asChild>
        <Button
          className="rounded-lg border-border bg-card text-foreground hover:bg-muted"
          data-testid="member-edit-open"
          onClick={(event) => event.stopPropagation()}
          type="button"
          variant="outline"
        >
          Sửa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" onClick={(event) => event.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Sửa hồ sơ hội viên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cá nhân của {member.fullName}. Email không thể thay đổi.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.fullName?.message} label="Họ và tên">
              <Input className={inputClass} data-testid="member-edit-name" {...register("fullName")} />
            </Field>
            <Field error={errors.phone?.message} label="Số điện thoại">
              <PhoneField className={inputClass} {...register("phone")} />
            </Field>
            <Field error={errors.dateOfBirth?.message} label="Ngày sinh">
              <DateOfBirthField className={inputClass} {...register("dateOfBirth")} />
            </Field>
            <Field label="Giới tính">
              <GenderSelect
                onChange={(value) => setValue("gender", value, { shouldValidate: true, shouldDirty: true })}
                value={watch("gender")}
              />
            </Field>
            <Field error={errors.address?.message} label="Địa chỉ">
              <Input className={inputClass} {...register("address")} />
            </Field>
            <Field error={errors.emergencyContact?.message} label="Liên hệ khẩn cấp">
              <Input className={inputClass} {...register("emergencyContact")} />
            </Field>
          </div>
          <Button
            className="rounded-xl bg-primary text-primary-foreground"
            data-testid="member-edit-submit"
            disabled={isSubmitting || updateMember.isPending}
            type="submit"
          >
            Lưu
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
    { value: "", label: "Tất cả" },
    { value: "active", label: "Hoạt động" },
    { value: "locked", label: "Đã khóa" },
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
          helper="Tất cả PT"
          icon={Dumbbell}
          label="Tổng PT"
          tone="neutral"
          value={String(total)}
        />
        <DirectoryMetricCard
          helper="Sẵn sàng nhận lịch"
          icon={BadgeCheck}
          label="Hoạt động"
          tone="success"
          value={String(activeTrainers)}
        />
        <DirectoryMetricCard
          helper="Tài khoản bị khóa"
          icon={ShieldCheck}
          label="Đã khóa"
          tone="warning"
          value={String(lockedTrainers)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.92fr)_minmax(0,1.08fr)]">
        <section className={cn(surfaceClass, "overflow-hidden")}>
          <div className="border-b border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Danh sách PT
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Quản lý huấn luyện viên
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi chuyên môn và hồ sơ của đội ngũ PT.
            </p>
          </div>

          <SearchToolbar
            action={<CreateTrainerDialog />}
            onSearch={setQuery}
            placeholder="Tìm PT theo tên hoặc chuyên môn..."
            value={query}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={statusOptions}
          />

          <div className="space-y-2 p-3">
            <ManagementStateBlock
              emptyTitle="Không tìm thấy huấn luyện viên."
              error={error}
              isLoading={isLoading}
              itemCount={filteredTrainers.length}
              loadingTitle="Đang tải danh sách huấn luyện viên..."
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
                        {trainer.specialty || "Chưa cập nhật chuyên môn"}
                      </span>
                    </span>
                    <StatusPill status={toStatus(trainer.status)} />
                  </div>
                  {trainer.yearsOfExperience != null && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <BadgeCheck aria-hidden="true" className="size-3.5 text-primary" />
                      {trainer.yearsOfExperience} năm kinh nghiệm
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
  const deleteTrainer = useDeleteManagedUser()
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  if (!selectedTrainer) {
    return (
      <section className={cn(surfaceClass, "p-6")}>
        <StateBlock
          description="Tạo hồ sơ PT hoặc dieu chinh bo loc tim kiem."
          title="Chưa chọn PT"
          tone="empty"
        />
      </section>
    )
  }

  const trainer = selectedTrainer

  const infoRows = [
    { label: "Email", value: trainer.email || "-" },
    { label: "Chuyên môn", value: trainer.specialty || "Chưa cập nhật" },
    {
      label: "Kinh nghiem",
      value: trainer.yearsOfExperience != null ? `${trainer.yearsOfExperience} nam` : "-",
    },
    { label: "Giới tính", value: formatGenderVi(trainer.gender) },
    { label: "Ngày sinh", value: formatDateVi(trainer.dateOfBirth) },
    { label: "Địa chỉ", value: trainer.address || "-" },
    { label: "Liên hệ khẩn cấp", value: trainer.emergencyContact || "-" },
    { label: "Ngay tao hồ sơ", value: formatDateVi(trainer.createdAt) },
  ]

  async function toggleLock() {
    try {
      await updateStatus.mutateAsync({
        userId: trainer.userId,
        input: { status: trainer.status === "locked" ? "active" : "locked" },
      })
      toast.success(trainer.status === "locked" ? "Đã mở khóa tài khoản PT" : "Đã khóa tài khoản PT")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function resetTrainerPassword() {
    try {
      const result = await resetPassword.mutateAsync(trainer.userId)
      setTemporaryPassword(result.temporaryPassword)
      toast.success("Đã tạo mật khẩu tạm thời")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function removeTrainer() {
    if (!window.confirm(`Xóa tài khoản PT "${trainer.fullName}"? Hồ sơ và lịch sử vẫn được giữ, email được giải phóng.`)) {
      return
    }
    try {
      await deleteTrainer.mutateAsync(trainer.userId)
      toast.success("Đã xóa tài khoản PT")
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
            {trainer.specialty || "Chưa cập nhật chuyên môn"}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail aria-hidden="true" className="size-4" />
            <span className="truncate">{trainer.email || "-"}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TrainerEditDialog trainer={trainer} />
            <TrainerAccountDialog trainer={trainer} />
            <Button className="rounded-xl" onClick={toggleLock} type="button" variant="outline">
              {trainer.status === "locked" ? "Mở khóa" : "Khóa"}
            </Button>
            <Button className="rounded-xl" onClick={resetTrainerPassword} type="button" variant="outline">
              Đặt lại mật khẩu
            </Button>
            <Button className="rounded-xl" data-testid="trainer-delete-button" disabled={deleteTrainer.isPending} onClick={removeTrainer} type="button" variant="destructive">
              <Trash2 aria-hidden="true" className="size-4" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-3 lg:grid-cols-2">
        <section className="gm-panel-muted p-5">
          <p className="mb-5 text-sm font-semibold text-foreground">Thông tin hồ sơ</p>
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
              Mật khẩu tạm thời: {temporaryPassword}
            </p>
          ) : null}
        </section>

        <section className="gm-panel-muted p-5">
          <p className="mb-5 text-sm font-semibold text-foreground">Giới thiệu</p>
          {trainer.bio ? (
            <p className="text-sm leading-6 text-muted-foreground">{trainer.bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có mô tả giới thiệu cho huấn luyện viên này.
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
    setValue,
    watch,
  } = useForm<UpdateTrainerFormValues>({
    resolver: zodResolver(updateTrainerSchema),
    values: {
      specialty: trainer.specialty ?? "",
      gender: toCanonicalGender(trainer.gender),
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
      toast.success("Đã cập nhật hồ sơ PT")
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
          gender: toCanonicalGender(trainer.gender),
          dateOfBirth: toDateInputValue(trainer.dateOfBirth),
          yearsOfExperience: trainer.yearsOfExperience?.toString() ?? "",
          bio: trainer.bio ?? "",
          address: trainer.address ?? "",
          emergencyContact: trainer.emergencyContact ?? "",
        })
      }
    }}>
      <DialogTrigger asChild>
        <Button data-testid="trainer-edit-open" className="rounded-xl" type="button" variant="outline">Sửa hồ sơ</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sửa hồ sơ PT</DialogTitle>
          <DialogDescription>Cập nhật chuyên môn và thông tin cá nhân cua PT.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.specialty?.message} label="Chuyên môn">
              <Input data-testid="trainer-edit-specialty" className={inputClass} {...register("specialty")} />
            </Field>
            <Field label="Giới tính">
              <GenderSelect
                onChange={(value) => setValue("gender", value, { shouldValidate: true, shouldDirty: true })}
                value={watch("gender")}
              />
            </Field>
            <Field error={errors.dateOfBirth?.message} label="Ngày sinh">
              <DateOfBirthField className={inputClass} {...register("dateOfBirth")} />
            </Field>
            <Field error={errors.yearsOfExperience?.message} label="Số năm kinh nghiệm">
              <Input className={inputClass} max={80} min={0} type="number" {...register("yearsOfExperience")} />
            </Field>
            <Field error={errors.address?.message} label="Địa chỉ">
              <Input className={inputClass} {...register("address")} />
            </Field>
            <Field error={errors.emergencyContact?.message} label="Liên hệ khẩn cấp">
              <Input className={inputClass} {...register("emergencyContact")} />
            </Field>
          </div>
          <Field label="Giới thiệu">
            <textarea className="gm-field min-h-24 w-full resize-none px-3 py-2 text-sm text-foreground" {...register("bio")} />
          </Field>
          <Button data-testid="trainer-edit-submit" className="rounded-xl bg-primary text-primary-foreground" disabled={isSubmitting || updateTrainer.isPending} type="submit">
            Lưu
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
      toast.success("Đã cập nhật tài khoản PT")
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
        <Button className="rounded-xl" type="button" variant="outline">Sửa tài khoản</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa tài khoản PT</DialogTitle>
          <DialogDescription>Cập nhật tên hiển thị và số điện thoại tài khoản.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Họ và tên">
            <Input className={inputClass} {...register("fullName")} />
          </Field>
          <Field label="Số điện thoại">
            <PhoneField className={inputClass} {...register("phone")} />
          </Field>
          <Button className="rounded-xl bg-primary text-primary-foreground" type="submit">Lưu</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
function formatGenderVi(gender?: string | null): string {
  if (!gender) return "—"
  return genderLabel(gender)
}

function formatDateVi(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
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
    { value: "", label: "Tất cả" },
    { value: "active", label: "Hoạt động" },
    { value: "locked", label: "Đã khóa" },
  ]

  const filteredUsers = useMemo(() => {
    if (!statusFilter) return users
    return users.filter((user) => user.status === statusFilter)
  }, [users, statusFilter])

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DirectoryMetricCard
          helper="Tất cả tài khoản"
          icon={UsersRound}
          label="Bản ghi"
          value={String(total)}
        />
        <DirectoryMetricCard
          helper="/api/v1/users"
          icon={ShieldCheck}
          label="Hợp đồng"
          tone="neutral"
          value="Người dùng"
        />
        <DirectoryMetricCard
          // helper="Backend spec 002"
          icon={BadgeCheck}
          label="Nguồn"
          tone="success"
          value="Sẵn sàng"
        />
      </div>

      <div className={cn(surfaceClass, "overflow-hidden")}>
        <SearchToolbar
          action={<CreateUserDialog label="Tạo tài khoản" title="Tạo tài khoản hệ thống" />}
          onSearch={setQuery}
          placeholder="Tìm người dùng theo tên, email, số điện thoại hoặc vai trò..."
          value={query}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
        />
        <div className="p-5">
          <ManagementStateBlock
            emptyTitle="Không tìm thấy tài khoản."
            error={error}
            isLoading={isLoading}
            itemCount={filteredUsers.length}
            loadingTitle="Đang tải danh sách quản trị..."
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
              Mật khẩu tạm thời: {user.initialPassword}
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
        description="Đang tải dữ liệu từ hệ thống..."
        title={loadingTitle}
        tone="loading"
      />
    )
  }

  if (error) {
    return (
      <StateBlock
        description="Vui lòng thử lại hoặc kiểm tra quyền của tài khoản."
        title={error.message}
        tone="error"
      />
    )
  }

  if (itemCount === 0) {
    return (
      <StateBlock
        description="Tạo hồ sơ mới hoặc điều chỉnh bộ lọc tìm kiếm."
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
  label = "Thêm người dùng",
  title = "Tạo tài khoản",
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
            Vai trò được lưu vào hồ sơ tài khoản. Người dùng không chọn role ở màn đăng nhập.
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
          Thêm PT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl p-0">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle>Tạo hồ sơ PT</DialogTitle>
          <DialogDescription>
            Tạo tài khoản đăng nhập role PT và hồ sơ huấn luyện viên trong một bước.
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
      dateOfBirth: "",
      gender: "",
      address: "",
      emergencyContact: "",
    },
  })

  async function onSubmit(values: CreateUserFormValues) {
    try {
      await createUser.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        role: fixedRole ?? values.role,
        password: values.password || undefined,
        phone: values.phone || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined,
        address: values.address || undefined,
        emergencyContact: values.emergencyContact || undefined,
      })
      reset({
        email: "",
        fullName: "",
        password: "",
        phone: "",
        role: fixedRole ?? "staff",
        dateOfBirth: "",
        gender: "",
        address: "",
        emergencyContact: "",
      })
      toast.success("Đã tạo tài khoản người dùng")
      onCreated?.()
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Field error={errors.fullName?.message} label="Họ và tên">
        <Input className={inputClass} data-testid="user-create-name" {...register("fullName")} />
      </Field>
      <Field error={errors.email?.message} label="Email">
        <Input className={inputClass} data-testid="user-create-email" type="email" {...register("email")} />
      </Field>
      <Field error={errors.phone?.message} label="Số điện thoại">
        <PhoneField className={inputClass} data-testid="user-create-phone" {...register("phone")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.dateOfBirth?.message} label="Ngày sinh">
          <DateOfBirthField className={inputClass} {...register("dateOfBirth")} />
        </Field>
        <Field label="Giới tính">
          <GenderSelect
            onChange={(value) => setValue("gender", value, { shouldValidate: true, shouldDirty: true })}
            value={watch("gender")}
          />
        </Field>
        <Field error={errors.address?.message} label="Địa chỉ">
          <Input className={inputClass} {...register("address")} />
        </Field>
        <Field error={errors.emergencyContact?.message} label="Liên hệ khẩn cấp">
          <Input className={inputClass} {...register("emergencyContact")} />
        </Field>
      </div>
      {!fixedRole ? (
        <Field error={errors.role?.message} label="Vai trò">
          {/* Visually hidden native select for Playwright test compatibility & React Hook Form registration */}
          <select
            className="sr-only"
            data-testid="user-create-role"
            {...register("role")}
          >
            <option value="staff">Lễ tân</option>
            <option value="admin">Quản trị viên</option>
          </select>

          <Select
            value={watch("role")}
            onValueChange={(val: string) => setValue("role", val as "staff" | "admin", { shouldValidate: true })}
          >
            <SelectTrigger className="min-h-11 w-full bg-background border border-border rounded-xl px-3 text-sm text-foreground focus-visible:ring-primary/20 focus-visible:border-primary">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
              <SelectItem value="staff" className="focus:bg-white/5 focus:text-white">Lễ tân</SelectItem>
              <SelectItem value="admin" className="focus:bg-white/5 focus:text-white">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs leading-5 text-muted-foreground">Màn này chỉ tạo tài khoản vận hành (Lễ tân/Quản trị viên). Hội viên tạo ở màn Hội viên, PT tạo ở màn Huấn luyện viên.</p>
        </Field>
      ) : null}
      <Field error={errors.password?.message} label="Mật khẩu">
        <Input className={inputClass} data-testid="user-create-password" placeholder="Để trống để sử dụng mật khẩu tạm thời" type="password" {...register("password")} />
      </Field>
      <Button className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95" data-testid="user-create-submit" disabled={isSubmitting || createUser.isPending} type="submit">
        <Plus aria-hidden="true" className="size-4" />
        Tạo tài khoản
      </Button>
    </form>
  )
}

function CreateTrainerPanel({ onCreated }: { onCreated?: () => void }) {
  const createTrainer = useCreateManagedTrainer()
  const [createdTrainer, setCreatedTrainer] = useState<CreateTrainerResult | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
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
      yearsOfExperience: "",
    })
    setCreatedTrainer(null)
  }

  async function onSubmit(values: CreateTrainerFormValues) {
    const yearsOfExperience = values.yearsOfExperience?.trim()
    const input = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      password: values.password || undefined,
      specialty: values.specialty.trim(),
      bio: values.bio?.trim() || undefined,
      gender: values.gender || undefined,
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
      toast.success("Đã tạo hồ sơ PT")
      onCreated?.()
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  if (createdTrainer?.initialPassword) {
    return (
      <div className="grid gap-5">
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
          <h3 className="text-lg font-semibold text-foreground">Đã tạo tài khoản PT</h3>
          <p className="mt-2 text-sm text-muted-foreground">Email: {createdTrainer.trainer.email}</p>
          <p className="mt-3 rounded-lg border border-primary/20 bg-background px-3 py-2 font-mono text-sm font-semibold text-foreground">
            Mật khẩu tạm thời: {createdTrainer.initialPassword}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Gửi mật khẩu này cho PT và nhắc họ đổi mật khẩu sau lần đăng nhập đầu.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="rounded-xl" onClick={resetForAnotherTrainer} type="button" variant="outline">
            Tạo PT khác
          </Button>
          <Button className="rounded-xl bg-primary text-primary-foreground" onClick={onCreated} type="button">
            Đóng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.fullName?.message} label="Họ và tên">
          <Input className={inputClass} data-testid="trainer-create-name" {...register("fullName")} />
        </Field>
        <Field error={errors.email?.message} label="Email">
          <Input className={inputClass} data-testid="trainer-create-email" type="email" {...register("email")} />
        </Field>
        <Field error={errors.phone?.message} label="Số điện thoại">
          <PhoneField className={inputClass} {...register("phone")} />
        </Field>
        <Field error={errors.password?.message} label="Mật khẩu">
          <Input className={inputClass} placeholder="Để trống để sử dụng mật khẩu tạm thời" type="password" {...register("password")} />
        </Field>
        <Field error={errors.specialty?.message} label="Chuyên môn">
          <Input className={inputClass} data-testid="trainer-create-specialty" {...register("specialty")} />
        </Field>
        <Field label="Giới tính">
          <GenderSelect
            onChange={(value) => setValue("gender", value, { shouldValidate: true, shouldDirty: true })}
            value={watch("gender")}
          />
        </Field>
        <Field error={errors.dateOfBirth?.message} label="Ngày sinh">
          <DateOfBirthField className={inputClass} {...register("dateOfBirth")} />
        </Field>
        <Field error={errors.yearsOfExperience?.message} label="Số năm kinh nghiệm">
          <Input className={inputClass} max={80} min={0} type="number" {...register("yearsOfExperience")} />
        </Field>
        <Field error={errors.address?.message} label="Địa chỉ">
          <Input className={inputClass} {...register("address")} />
        </Field>
        <Field error={errors.emergencyContact?.message} label="Liên hệ khẩn cấp">
          <Input className={inputClass} {...register("emergencyContact")} />
        </Field>
      </div>

      <Field label="Giới thiệu">
        <textarea
          className="gm-field min-h-24 w-full resize-none px-3 py-2 text-sm text-foreground transition placeholder:text-muted-foreground"
          {...register("bio")}
        />
      </Field>

      <Button className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95" data-testid="trainer-create-submit" disabled={isSubmitting || createTrainer.isPending} type="submit">
        <Plus aria-hidden="true" className="size-4" />
        Tạo hồ sơ PT
      </Button>
    </form>
  )
}
