"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Badge,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Filter,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react"

import { StatusPill, type Status } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  useCreateManagedMember,
  useCreateManagedTrainer,
  useCreateManagedUser,
  useDeleteManagedMember,
  useManagedMembers,
  useManagedTrainers,
  useManagedUsers,
  useUpdateManagedMember,
} from "@/features/member-management/api/member-management.queries"
import {
  createMemberSchema,
  createTrainerSchema,
  createUserSchema,
  type CreateMemberFormValues,
  type CreateTrainerFormValues,
  type CreateUserFormValues,
} from "@/features/member-management/schemas/member-management.schemas"
import type {
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
  "rounded-xl border border-[#e1e2ec] bg-white shadow-[0_4px_24px_rgba(25,27,35,0.04)]"
const inputClass =
  "min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-white px-3 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/15"
const labelClass = "text-sm font-semibold text-[#191b23]"

const modeConfig = {
  members: {
    title: "Member Directory",
    description: "Create, search, update, and soft-delete member profiles.",
    createTitle: "Add Member",
    icon: UserRound,
    queryPlaceholder: "Search name, email, phone, or member code",
  },
  users: {
    title: "User & Role Management",
    description: "Create role-bound user accounts and temporary passwords.",
    createTitle: "Create User",
    icon: ShieldCheck,
    queryPlaceholder: "Search users by name, email, phone, or role",
  },
  staff: {
    title: "Staff Management",
    description: "Create and review front desk staff accounts.",
    createTitle: "Create Staff",
    icon: Badge,
    queryPlaceholder: "Search staff by name, email, or phone",
  },
  trainers: {
    title: "PT Management",
    description: "Create trainer profiles and review coaching specialties.",
    createTitle: "Create PT",
    icon: Dumbbell,
    queryPlaceholder: "Search trainers by name or specialty",
  },
} as const

function toStatus(status: string): Status {
  if (status === "active" || status === "pending" || status === "expired" || status === "locked") {
    return status
  }

  return "unknown"
}

function FormError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="text-sm font-medium text-[#ba1a1a]">{message}</p>
}

export function ManagementWorkspace({
  canDeleteMembers = false,
  detailBasePath,
  mode,
}: ManagementWorkspaceProps) {
  const [query, setQuery] = useState("")
  const config = modeConfig[mode]
  const Icon = config.icon
  const isMembersMode = mode === "members"
  const isTrainersMode = mode === "trainers"
  const userRole = mode === "staff" ? "staff" : mode === "users" ? undefined : undefined
  const membersQuery = useManagedMembers(isMembersMode ? query : "")
  const usersQuery = useManagedUsers(userRole, mode === "users" || mode === "staff" ? query : "")
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

  const summary = useMemo(
    () => [
      { label: "Records", value: String(total), tone: "dark" },
      { label: "Contract", value: mode === "members" ? "/api/members" : mode === "trainers" ? "/api/trainers" : "/api/v1/users" },
      { label: "Source", value: "Backend spec 002" },
    ],
    [mode, total],
  )

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
    <section className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <div
            className={cn(
              "rounded-xl p-5",
              item.tone === "dark"
                ? "border border-white/10 bg-[#191b23] text-white"
                : "border border-[#e1e2ec] bg-white text-[#191b23]",
            )}
            key={item.label}
          >
            <p className={cn("text-sm", item.tone === "dark" ? "text-[#c2c6d8]" : "text-[#424754]")}>
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className={cn(surfaceClass, "overflow-hidden")}>
          <div className="flex flex-col gap-4 border-b border-[#e1e2ec] p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#d8e2ff] text-[#0058be]">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#191b23]">
                  {config.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#424754]">
                  {config.description}
                </p>
              </div>
            </div>
            <label className="relative w-full md:max-w-sm">
              <span className="sr-only">Search records</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
              />
              <input
                className="min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-[#f9f9ff] pl-10 pr-3 text-sm outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/15"
                data-testid={isMembersMode ? "staff-member-search-input" : "management-search-input"}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={config.queryPlaceholder}
                value={query}
              />
            </label>
          </div>

          <div className="p-5">
            {activeQuery.isLoading ? (
              <StateBlock
                description="Loading records from the MSW/backend management contract."
                title="Loading management records..."
                tone="loading"
              />
            ) : null}

            {error ? (
              <StateBlock
                description="Try again or verify your role permission."
                title={error.message}
                tone="error"
              />
            ) : null}

            {!activeQuery.isLoading && !error && total === 0 ? (
              <StateBlock
                description="Create a record or adjust the search query."
                title="No records found."
                tone="empty"
              />
            ) : null}

            {isMembersMode && membersQuery.data?.items.length ? (
              <MemberList
                canDelete={canDeleteMembers}
                detailBasePath={detailBasePath}
                members={membersQuery.data.items}
              />
            ) : null}

            {(mode === "users" || mode === "staff") && usersQuery.data?.items.length ? (
              <UserList users={usersQuery.data.items} />
            ) : null}

            {isTrainersMode && trainersQuery.data?.items.length ? (
              <TrainerList trainers={trainersQuery.data.items} />
            ) : null}
          </div>
        </div>

        <div className={cn(surfaceClass, "p-5")}>
          {isMembersMode ? <CreateMemberPanel /> : null}
          {mode === "users" ? <CreateUserPanel /> : null}
          {isTrainersMode ? <CreateTrainerPanel /> : null}
        </div>
      </div>
    </section>
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
  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-3xl font-black tracking-tight text-[#191b23]">
              Member Directory
            </h2>
            <span className="rounded-full bg-[#0058be]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0058be]">
              Admin
            </span>
          </div>
          <p className="text-sm font-semibold text-[#595e6d]">
            Member Management · active and inactive member profiles.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Search members</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
            />
            <input
              className="min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-white pl-10 pr-3 text-sm text-[#191b23] outline-none transition-all focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/15"
              data-testid="staff-member-search-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search members..."
              value={query}
            />
          </label>
          <Button
            className="min-h-11 rounded-lg border-[#c2c6d6] bg-white text-[#191b23] hover:bg-[#f2f3fd] active:scale-[0.98]"
            type="button"
            variant="outline"
          >
            <Filter aria-hidden="true" className="size-4" />
            Filter
          </Button>
          <Button
            className="min-h-11 rounded-lg bg-[#0058be] text-white hover:bg-[#2170e4] active:scale-[0.98]"
            type="button"
          >
            <UserPlus aria-hidden="true" className="size-4" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-xl border border-[#c2c6d6] bg-white shadow-[0_4px_24px_rgba(25,27,35,0.04)]">
          {isLoading ? (
            <StateBlock
              className="m-5"
              description="Loading records from the MSW/backend member contract."
              title="Loading member directory..."
              tone="loading"
            />
          ) : null}
          {error ? (
            <StateBlock
              className="m-5"
              description="Try again or verify your role permission."
              title={error.message}
              tone="error"
            />
          ) : null}
          {!isLoading && !error && members.length === 0 ? (
            <StateBlock
              className="m-5"
              description="Create a record or adjust the search query."
              title="No members found."
              tone="empty"
            />
          ) : null}
          {members.length > 0 ? (
            <MemberTable
              canDelete={canDeleteMembers}
              detailBasePath={detailBasePath}
              members={members}
              total={total}
            />
          ) : null}
        </section>

        <aside className={cn(surfaceClass, "p-5")}>
          <CreateMemberPanel />
        </aside>
      </div>
    </section>
  )
}

function MemberTable({
  canDelete,
  detailBasePath,
  members,
  total,
}: {
  canDelete: boolean
  detailBasePath?: string
  members: ManagedMember[]
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
      toast.success("Member status updated")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function removeMember(member: ManagedMember) {
    try {
      await deleteMember.mutateAsync(member.id)
      toast.success("Member soft-deleted")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <div data-testid="management-member-list">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-[#c2c6d6] bg-[#f9f9ff]">
            <tr>
              {["Member Name", "Status", "Last Check-in", "Package Type", "Actions"].map(
                (heading) => (
                  <th
                    className={cn(
                      "px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-[#595e6d]",
                      heading === "Actions" ? "text-right" : "",
                    )}
                    key={heading}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e1e2ec] text-sm">
            {members.map((member) => (
              <tr
                className="group transition-colors hover:bg-[#f2f3fd]"
                data-testid="staff-member-result"
                key={member.id}
              >
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full border border-[#c2c6d6] bg-[#d8e2ff] text-sm font-black text-[#0058be]">
                      {initials(member.fullName)}
                    </div>
                    <div>
                      <div className="font-bold text-[#191b23]">
                        {member.fullName}
                      </div>
                      <div className="text-xs text-[#595e6d]">{member.email}</div>
                      <div className="text-xs text-[#595e6d]">{member.memberCode}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <StatusPill status={toStatus(member.status)} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[#595e6d]">
                  {member.status === "active" ? "Today, 08:30 AM" : "Oct 24, 2023"}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[#595e6d]">
                  {member.status === "expired" ? "Standard Monthly" : "Premium 30"}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    {detailBasePath ? (
                      <Button
                        asChild
                        className="rounded-lg border-[#c2c6d6] bg-white text-[#191b23] hover:bg-[#f2f3fd]"
                        variant="outline"
                      >
                        <Link href={`${detailBasePath}/${member.id}`}>
                          Open
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      className="rounded-lg border-[#c2c6d6] bg-white text-[#191b23] hover:bg-[#f2f3fd]"
                      disabled={updateMember.isPending}
                      onClick={() => markExpired(member)}
                      type="button"
                      variant="outline"
                    >
                      Mark expired
                    </Button>
                    {canDelete ? (
                      <Button
                        className="rounded-lg"
                        disabled={deleteMember.isPending}
                        onClick={() => removeMember(member)}
                        type="button"
                        variant="destructive"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[#c2c6d6] bg-white px-5 py-3 text-xs font-semibold text-[#595e6d]">
        <span>
          Showing 1 to {members.length} of {total} entries
        </span>
        <div className="flex items-center gap-1">
          <Button className="size-8 rounded-md" disabled type="button" variant="ghost">
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
          <span className="flex size-8 items-center justify-center rounded-md bg-[#0058be] text-white">
            1
          </span>
          <Button className="size-8 rounded-md" type="button" variant="ghost">
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

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
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selectedStaff =
    users.find((user) => user.userId === selectedId) ?? users[0] ?? null

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#191b23]">
            Staff Directory
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#595e6d]">
            Staff Management · manage team members and access defaults.
          </p>
        </div>
        <Button
          className="min-h-11 rounded-lg bg-[#0058be] text-white hover:bg-[#2170e4] active:scale-[0.98]"
          type="button"
        >
          <UserPlus aria-hidden="true" className="size-4" />
          Add Staff
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="flex min-h-[580px] flex-col overflow-hidden rounded-xl border border-[#c2c6d6] bg-white shadow-[0_4px_24px_rgba(25,27,35,0.04)] lg:col-span-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#c2c6d6] bg-[#f9f9ff] p-4">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[#595e6d]">
              Active Roster
            </span>
            <label className="relative max-w-44">
              <span className="sr-only">Search staff</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
              />
              <input
                className="min-h-9 w-full rounded-md border border-[#c2c6d6] bg-white pl-8 pr-2 text-sm outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15"
                data-testid="management-search-input"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search staff..."
                value={query}
              />
            </label>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            <ManagementStateBlock
              emptyTitle="No staff found."
              error={error}
              isLoading={isLoading}
              itemCount={users.length}
              loadingTitle="Loading staff roster..."
            />
            {users.map((user) => {
              const active = selectedStaff?.userId === user.userId
              return (
                <button
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
                    active
                      ? "border-[#c2c6d6] bg-[#f2f3fd]"
                      : "border-transparent hover:bg-[#f9f9ff]",
                  )}
                  key={user.userId}
                  onClick={() => setSelectedId(user.userId)}
                  type="button"
                >
                  {active ? (
                    <span className="absolute bottom-0 left-0 top-0 w-1 bg-[#0058be]" />
                  ) : null}
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#c2c6d6] bg-[#dbdff1] font-black text-[#5d6272]">
                    {initials(user.fullName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#191b23]">
                      {user.fullName}
                    </span>
                    <span className="block truncate text-xs text-[#595e6d]">
                      Front Desk Staff
                    </span>
                    {user.initialPassword ? (
                      <span className="mt-1 block truncate font-mono text-[11px] font-bold text-[#0058be]">
                        Initial password: {user.initialPassword}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-semibold text-[#595e6d]">
                    {user.status === "active" ? "Active" : "Locked"}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="grid gap-4 lg:col-span-8 md:grid-cols-2">
          <section className={cn(surfaceClass, "p-5")}>
            {selectedStaff ? <StaffProfileCard user={selectedStaff} /> : null}
          </section>
          <section className={cn(surfaceClass, "flex flex-col bg-white p-5")}>
            <StaffAccessControl user={selectedStaff} />
          </section>
          <section className={cn(surfaceClass, "p-5 md:col-span-2")}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-[#595e6d]">
                  Team Stats
                </p>
                <h3 className="mt-1 text-xl font-black text-[#191b23]">
                  {total} staff accounts
                </h3>
              </div>
              <MoreHorizontal aria-hidden="true" className="size-5 text-[#727785]" />
            </div>
            <CreateUserPanel fixedRole="staff" />
          </section>
        </div>
      </div>
    </section>
  )
}

function StaffProfileCard({ user }: { user: ManagedUser }) {
  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-[#ecedf7] bg-[#0058be] text-xl font-black text-white">
            {initials(user.fullName)}
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-[#191b23]">
              {user.fullName}
            </h3>
            <p className="mt-1 text-sm font-bold text-[#0058be]">
              Front Desk Staff
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-[#c2c6d6] bg-[#f2f3fd] px-2 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#424754]">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          Staff
        </span>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#e1e2ec] bg-[#f9f9ff] p-3">
          <span className="mb-1 block text-xs font-black uppercase tracking-[0.08em] text-[#595e6d]">
            Contact
          </span>
          <p className="truncate text-sm font-semibold text-[#191b23]">
            {user.email}
          </p>
          <p className="mt-1 text-sm text-[#595e6d]">{user.phone ?? "No phone"}</p>
        </div>
        <div className="rounded-lg border border-[#e1e2ec] bg-[#f9f9ff] p-3">
          <span className="mb-1 block text-xs font-black uppercase tracking-[0.08em] text-[#595e6d]">
            Employment
          </span>
          <p className="text-sm font-semibold text-[#191b23]">Started: Oct 12, 2021</p>
          <p className="mt-1 text-sm text-[#595e6d]">Type: Full-Time</p>
        </div>
      </div>
      <span className="mb-3 block text-xs font-black uppercase tracking-[0.1em] text-[#595e6d]">
        Upcoming Shifts
      </span>
      <div className="space-y-2">
        {[
          ["Today", "08:00 AM - 04:00 PM", "Floor Duty"],
          ["Tomorrow", "10:00 AM - 06:00 PM", "PT Sessions"],
        ].map(([day, time, label]) => (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-[#c2c6d6] bg-white p-3"
            key={day}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-[#0058be]/10 p-2 text-[#0058be]">
                <CalendarDays aria-hidden="true" className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-bold text-[#191b23]">{day}</span>
                <span className="block text-xs text-[#595e6d]">{time}</span>
              </span>
            </div>
            <span className="rounded-md bg-[#d8e2ff] px-2 py-1 text-xs font-bold text-[#0058be]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StaffAccessControl({ user }: { user: ManagedUser | null }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between border-b border-[#c2c6d6] pb-3">
        <span className="text-xs font-black uppercase tracking-[0.1em] text-[#595e6d]">
          Access Control
        </span>
        <Button className="rounded-lg text-[#0058be]" type="button" variant="ghost">
          Edit
        </Button>
      </div>
      <div className="flex-1 space-y-2">
        {[
          ["Member lookup", "Search and open member profiles.", true],
          ["Package sales", "Sell and renew memberships.", true],
          ["Check-in terminal", "Confirm front desk check-ins.", true],
          ["Financial reports", "View revenue exports.", false],
        ].map(([title, description, enabled]) => (
          <label
            className={cn(
              "flex items-start gap-3 rounded-lg p-3 transition hover:bg-[#f9f9ff]",
              enabled ? "" : "opacity-60",
            )}
            key={title as string}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 items-center justify-center rounded border",
                enabled
                  ? "border-[#0058be] bg-[#0058be] text-white"
                  : "border-[#c2c6d6] bg-[#f2f3fd]",
              )}
            >
              {enabled ? <Check aria-hidden="true" className="size-3" /> : null}
            </span>
            <span>
              <span className="block text-sm font-bold text-[#191b23]">
                {title}
              </span>
              <span className="block text-xs text-[#595e6d]">
                {description}
              </span>
            </span>
          </label>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-[#f4c7c3] bg-[#ffedea] p-3">
        <p className="text-sm font-bold text-[#ba1a1a]">Operational account</p>
        <p className="mt-1 text-xs leading-5 text-[#595e6d]">
          {user ? user.fullName : "Selected staff"} can access front desk tools.
          Keep credentials current before demo sessions.
        </p>
      </div>
    </>
  )
}

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
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selectedTrainer =
    trainers.find((trainer) => trainer.id === selectedId) ?? trainers[0] ?? null

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#191b23]">
            PT Management
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#595e6d]">
            Trainer roster, capacity, and daily schedule.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Search trainers</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
            />
            <input
              className="min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-white pl-10 pr-3 text-sm text-[#191b23] outline-none transition-all focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/15"
              data-testid="management-search-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search trainers..."
              value={query}
            />
          </label>
          <Button
            className="min-h-11 rounded-lg bg-[#0058be] text-white hover:bg-[#2170e4] active:scale-[0.98]"
            type="button"
          >
            <UserPlus aria-hidden="true" className="size-4" />
            Add Trainer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="grid gap-4 lg:col-span-4">
          <section className={cn(surfaceClass, "p-5")}>
            <div className="mb-4 flex items-center justify-between border-b border-[#c2c6d6] pb-3">
              <h3 className="text-xs font-black uppercase tracking-[0.1em] text-[#595e6d]">
                Active Roster
              </h3>
              <Filter aria-hidden="true" className="size-5 text-[#727785]" />
            </div>
            <ManagementStateBlock
              emptyTitle="No trainers found."
              error={error}
              isLoading={isLoading}
              itemCount={trainers.length}
              loadingTitle="Loading trainer roster..."
            />
            <div className="space-y-2" data-testid="management-trainer-list">
              {trainers.map((trainer, index) => {
                const active = selectedTrainer?.id === trainer.id
                const assigned = index === 0 ? "14/15" : index === 1 ? "8/10" : "18/15"
                return (
                  <button
                    className={cn(
                      "relative w-full rounded-lg border p-3 text-left transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:bg-[#f9f9ff] active:scale-[0.98]",
                      active ? "border-[#0058be]/25 bg-[#f2f3fd]" : "border-transparent",
                    )}
                    key={trainer.id}
                    onClick={() => setSelectedId(trainer.id)}
                    type="button"
                  >
                    {active ? (
                      <span className="absolute bottom-0 left-0 top-0 w-1 bg-[#0058be]" />
                    ) : null}
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full border border-[#c2c6d6] bg-[#dbdff1] font-black text-[#5d6272]">
                        {initials(trainer.fullName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#191b23]">
                          {trainer.fullName}
                        </span>
                        <span className="block truncate text-xs text-[#595e6d]">
                          {trainer.specialty}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                        <Star aria-hidden="true" className="size-3 fill-current" />
                        {(4.9 - index / 10).toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between border-t border-[#e1e2ec] pt-2 text-xs font-semibold text-[#595e6d]">
                      <span>
                        Capacity: <strong className="text-[#191b23]">{assigned}</strong>
                      </span>
                      <span>
                        Sessions: <strong className="text-[#191b23]">{24 + index * 4}</strong>
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
          <section className={cn(surfaceClass, "p-5")}>
            <CreateTrainerPanel />
          </section>
        </aside>

        <div className="grid gap-4 lg:col-span-8">
          <TrainerProfileHero total={total} trainer={selectedTrainer} />
          <TrainerSchedule />
        </div>
      </div>
    </section>
  )
}

function TrainerProfileHero({
  total,
  trainer,
}: {
  total: number
  trainer: ManagedTrainer | null
}) {
  if (!trainer) {
    return (
      <section className={cn(surfaceClass, "p-5")}>
        <StateBlock
          description="Create a trainer profile or adjust your search."
          title="No trainer selected"
          tone="empty"
        />
      </section>
    )
  }

  return (
    <section className={cn(surfaceClass, "relative overflow-hidden p-6")}>
      <div className="absolute right-0 top-0 size-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#d8e2ff]/40 blur-3xl" />
      <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div className="flex gap-5">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-xl border border-[#c2c6d6] bg-[#0058be] text-2xl font-black text-white shadow-sm">
            {initials(trainer.fullName)}
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-[#191b23]">
                {trainer.fullName}
              </h2>
              <span className="rounded-md border border-[#0058be]/20 bg-[#0058be]/10 px-2 py-1 text-xs font-bold text-[#0058be]">
                Level 3
              </span>
            </div>
            <p className="mb-5 text-sm font-semibold text-[#595e6d]">
              {trainer.specialty}
            </p>
            <div className="flex flex-wrap gap-6">
              <Metric label="Assigned" value={`${Math.min(total + 9, 14)}/15`} />
              <Metric label="Sessions (Wk)" value="24" />
              <Metric label="Rating" value="4.9" />
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <Button className="rounded-lg border-[#c2c6d6] bg-white text-[#191b23] hover:bg-[#f2f3fd]" type="button" variant="outline">
            <MessageSquare aria-hidden="true" className="size-4" />
            Message
          </Button>
          <Button className="rounded-lg border-[#c2c6d6] bg-white text-[#191b23] hover:bg-[#f2f3fd]" type="button" variant="outline">
            Edit Profile
          </Button>
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#595e6d]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-[#191b23]">{value}</p>
    </div>
  )
}

function TrainerSchedule() {
  const items = [
    ["08:00 AM", "1:1 with John D.", "Strength", "done"],
    ["10:00 AM", "Small Group (Max 4)", "HIIT Studio", "active"],
    ["01:00 PM", "Consultation: Emma W.", "Office B", "future"],
    ["02:00 PM", "Blocked", "Break", "blocked"],
  ] as const

  return (
    <section className={cn(surfaceClass, "p-6")}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.1em] text-[#595e6d]">
          Today&apos;s Schedule
        </h3>
        <div className="flex items-center gap-2">
          <ChevronLeft aria-hidden="true" className="size-4 text-[#727785]" />
          <span className="text-sm font-bold text-[#191b23]">Tue, Jun 2</span>
          <ChevronRight aria-hidden="true" className="size-4 text-[#727785]" />
        </div>
      </div>
      <div className="relative space-y-4 before:absolute before:bottom-0 before:left-4 before:top-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-[#c2c6d6] before:to-transparent">
        {items.map(([time, title, meta, state]) => (
          <div className="relative flex gap-4 pl-1" key={`${time}-${title}`}>
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm",
                state === "active"
                  ? "border-[#0058be] bg-[#d8e2ff] text-[#0058be] ring-4 ring-[#d8e2ff]/50"
                  : "border-[#c2c6d6] text-[#595e6d]",
              )}
            >
              {state === "done" ? <Check aria-hidden="true" className="size-4" /> : <CalendarDays aria-hidden="true" className="size-4" />}
            </span>
            <div
              className={cn(
                "flex-1 rounded-lg border p-3",
                state === "active"
                  ? "border-[#0058be]/20 bg-[#d8e2ff]/35"
                  : state === "blocked"
                    ? "border-dashed border-[#c2c6d6] bg-[#f2f3fd]"
                    : "border-[#e1e2ec] bg-white",
              )}
            >
              <div className="mb-1 flex justify-between gap-3">
                <span className="text-xs font-black text-[#0058be]">{time}</span>
                <span className="text-xs font-semibold text-[#595e6d]">
                  {state === "active" ? "60m · In Progress" : "60m"}
                </span>
              </div>
              <p className="font-bold text-[#191b23]">{title}</p>
              <p className="mt-1 text-xs font-semibold text-[#595e6d]">{meta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
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
        description="Loading records from the MSW/backend management contract."
        title={loadingTitle}
        tone="loading"
      />
    )
  }

  if (error) {
    return (
      <StateBlock
        description="Try again or verify your role permission."
        title={error.message}
        tone="error"
      />
    )
  }

  if (itemCount === 0) {
    return (
      <StateBlock
        description="Create a record or adjust the search query."
        title={emptyTitle}
        tone="empty"
      />
    )
  }

  return null
}

function MemberList({
  canDelete,
  detailBasePath,
  members,
}: {
  canDelete: boolean
  detailBasePath?: string
  members: ManagedMember[]
}) {
  const updateMember = useUpdateManagedMember()
  const deleteMember = useDeleteManagedMember()

  async function markExpired(member: ManagedMember) {
    try {
      await updateMember.mutateAsync({
        memberId: member.id,
        input: { status: "expired" },
      })
      toast.success("Member status updated")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function removeMember(member: ManagedMember) {
    try {
      await deleteMember.mutateAsync(member.id)
      toast.success("Member soft-deleted")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <div className="grid gap-3" data-testid="management-member-list">
      {members.map((member) => (
        <article
          className="grid gap-4 rounded-xl border border-[#e1e2ec] bg-[#f9f9ff] p-4 transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[minmax(0,1fr)_auto]"
          data-testid="staff-member-result"
          key={member.id}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-[#191b23]">{member.fullName}</h3>
              <StatusPill status={toStatus(member.status)} />
            </div>
            <div className="mt-2 grid gap-1 text-sm text-[#424754] sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <Badge aria-hidden="true" className="size-4 text-[#0058be]" />
                {member.memberCode}
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone aria-hidden="true" className="size-4 text-[#0058be]" />
                {member.phone}
              </span>
              <span className="inline-flex items-center gap-2 sm:col-span-2">
                <Mail aria-hidden="true" className="size-4 text-[#0058be]" />
                {member.email}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {detailBasePath ? (
              <Button asChild className="rounded-lg bg-[#0058be] text-white hover:bg-[#2170e4]">
                <Link href={`${detailBasePath}/${member.id}`}>Open</Link>
              </Button>
            ) : null}
            <Button
              className="rounded-lg border-[#c2c6d6]"
              disabled={updateMember.isPending}
              onClick={() => markExpired(member)}
              type="button"
              variant="outline"
            >
              Mark expired
            </Button>
            {canDelete ? (
              <Button
                className="rounded-lg"
                disabled={deleteMember.isPending}
                onClick={() => removeMember(member)}
                type="button"
                variant="destructive"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}

function UserList({ users }: { users: ManagedUser[] }) {
  return (
    <div className="grid gap-3" data-testid="management-user-list">
      {users.map((user) => (
        <article
          className="rounded-xl border border-[#e1e2ec] bg-[#f9f9ff] p-4"
          key={user.userId}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#191b23]">{user.fullName}</h3>
              <p className="mt-1 text-sm text-[#424754]">{user.email}</p>
              {user.phone ? <p className="mt-1 text-sm text-[#424754]">{user.phone}</p> : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <StatusPill label={user.role.toUpperCase()} status="assigned" />
              <StatusPill status={toStatus(user.status)} />
            </div>
          </div>
          {user.initialPassword ? (
            <p className="mt-3 rounded-lg border border-[#adc6ff] bg-[#d8e2ff]/60 px-3 py-2 font-mono text-xs text-[#001a42]">
              Initial password: {user.initialPassword}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}

function TrainerList({ trainers }: { trainers: ManagedTrainer[] }) {
  return (
    <div className="grid gap-3" data-testid="management-trainer-list">
      {trainers.map((trainer) => (
        <article
          className="rounded-xl border border-[#e1e2ec] bg-[#f9f9ff] p-4"
          key={trainer.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#191b23]">{trainer.fullName}</h3>
              <p className="mt-1 text-sm text-[#424754]">{trainer.specialty}</p>
            </div>
            <StatusPill status={toStatus(trainer.status)} />
          </div>
        </article>
      ))}
    </div>
  )
}

function CreateMemberPanel() {
  const createMember = useCreateManagedMember()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateMemberFormValues>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
    },
  })

  async function onSubmit(values: CreateMemberFormValues) {
    try {
      await createMember.mutateAsync(values)
      reset()
      toast.success("Member profile created")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <CreatePanelHeader title="Add Member" />
      <Field error={errors.fullName?.message} label="Full name">
        <input className={inputClass} data-testid="member-create-name" {...register("fullName")} />
      </Field>
      <Field error={errors.email?.message} label="Email">
        <input className={inputClass} data-testid="member-create-email" type="email" {...register("email")} />
      </Field>
      <Field error={errors.phone?.message} label="Phone">
        <input className={inputClass} data-testid="member-create-phone" {...register("phone")} />
      </Field>
      <Field label="Address">
        <input className={inputClass} {...register("address")} />
      </Field>
      <Button className="min-h-11 rounded-lg bg-[#0058be] text-white hover:bg-[#2170e4]" data-testid="member-create-submit" disabled={isSubmitting} type="submit">
        <Plus aria-hidden="true" className="size-4" />
        Create member
      </Button>
    </form>
  )
}

function CreateUserPanel({ fixedRole }: { fixedRole?: "staff" }) {
  const createUser = useCreateManagedUser()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
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
      toast.success("User account created")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <CreatePanelHeader title={fixedRole ? "Create Staff" : "Create User"} />
      <Field error={errors.fullName?.message} label="Full name">
        <input className={inputClass} data-testid="user-create-name" {...register("fullName")} />
      </Field>
      <Field error={errors.email?.message} label="Email">
        <input className={inputClass} data-testid="user-create-email" type="email" {...register("email")} />
      </Field>
      <Field label="Phone">
        <input className={inputClass} data-testid="user-create-phone" {...register("phone")} />
      </Field>
      {!fixedRole ? (
        <Field error={errors.role?.message} label="Role">
          <select className={inputClass} data-testid="user-create-role" {...register("role")}>
            <option value="staff">Staff</option>
            <option value="pt">PT</option>
            <option value="member">Member</option>
          </select>
        </Field>
      ) : null}
      <Field error={errors.password?.message} label="Password">
        <input className={inputClass} data-testid="user-create-password" placeholder="Leave blank for temporary password" type="password" {...register("password")} />
      </Field>
      <Button className="min-h-11 rounded-lg bg-[#0058be] text-white hover:bg-[#2170e4]" data-testid="user-create-submit" disabled={isSubmitting} type="submit">
        <Plus aria-hidden="true" className="size-4" />
        Create account
      </Button>
    </form>
  )
}

function CreateTrainerPanel() {
  const createTrainer = useCreateManagedTrainer()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateTrainerFormValues>({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: {
      fullName: "",
      specialty: "",
    },
  })

  async function onSubmit(values: CreateTrainerFormValues) {
    try {
      await createTrainer.mutateAsync({
        fullName: values.fullName,
        specialty: values.specialty,
        userId: values.userId ? Number(values.userId) : undefined,
      })
      reset()
      toast.success("Trainer profile created")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <CreatePanelHeader title="Create PT Profile" />
      <Field error={errors.fullName?.message} label="Full name">
        <input className={inputClass} data-testid="trainer-create-name" {...register("fullName")} />
      </Field>
      <Field error={errors.specialty?.message} label="Specialty">
        <input className={inputClass} data-testid="trainer-create-specialty" {...register("specialty")} />
      </Field>
      <Field label="Linked user ID">
        <input className={inputClass} type="number" {...register("userId")} />
      </Field>
      <Button className="min-h-11 rounded-lg bg-[#0058be] text-white hover:bg-[#2170e4]" data-testid="trainer-create-submit" disabled={isSubmitting} type="submit">
        <Plus aria-hidden="true" className="size-4" />
        Create PT profile
      </Button>
    </form>
  )
}

function CreatePanelHeader({ title }: { title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#0058be]">
        Spec 002
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#191b23]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#424754]">
        Mutations use MSW/backend contracts and preserve role permissions.
      </p>
    </div>
  )
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode
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
