"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Badge,
  Dumbbell,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
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
          {mode === "staff" ? <CreateUserPanel fixedRole="staff" /> : null}
          {isTrainersMode ? <CreateTrainerPanel /> : null}
        </div>
      </div>
    </section>
  )
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
