"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  Check,
  KeyRound,
  Lock,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserPlus,
} from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { RoleBadge } from "@/components/data/RoleBadge"
import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  useCreateManagedUser,
  useDeleteManagedUser,
  useManagedUsers,
  useResetManagedUserPassword,
  useUpdateManagedUser,
  useUpdateManagedUserStatus,
} from "@/features/member-management/api/member-management.queries"
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "@/features/member-management/schemas/member-management.schemas"
import type { ManagedUser } from "@/features/member-management/types/member-management.types"
import { mapMemberManagementError } from "@/features/member-management/utils/member-management-errors"
import { cn } from "@/lib/utils"

const roles = ["staff", "pt", "member"] as const

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function roleLabel(role: ManagedUser["role"]) {
  if (role === "pt") return "Trainer"
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function toStatus(status: ManagedUser["status"]) {
  return status === "active" || status === "locked" ? status : "unknown"
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
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
        {label}
      </span>
      {children}
      {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
    </label>
  )
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"

export function AdminUsersTemplateWorkspace() {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const usersQuery = useManagedUsers(undefined, query)
  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data?.items])
  const selectedUser =
    users.find((user) => user.userId === selectedId) ?? users[0] ?? null

  const metrics = useMemo(() => {
    const active = users.filter((user) => user.status === "active").length
    const locked = users.filter((user) => user.status === "locked").length
    const trainers = users.filter((user) => user.role === "pt").length

    return [
      { label: "Visible users", value: String(usersQuery.data?.total ?? 0) },
      { label: "Active", value: String(active) },
      { label: "Locked", value: String(locked) },
      { label: "Trainers", value: String(trainers) },
    ]
  }, [users, usersQuery.data?.total])

  return (
    <section className="grid min-h-[calc(100dvh-220px)] gap-4 lg:grid-cols-12">
      <aside className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:col-span-3">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
              Team
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
              Directory
            </h2>
          </div>
          <UserPlus aria-hidden="true" className="size-5 text-primary" />
        </div>

        <label className="relative border-b border-zinc-200 bg-zinc-50 p-3">
          <span className="sr-only">Search team</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            data-testid="admin-user-search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search team..."
            value={query}
          />
        </label>

        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {usersQuery.isLoading ? (
            <StateBlock title="Loading users..." tone="loading" />
          ) : null}
          {usersQuery.error ? (
            <StateBlock
              title={
                usersQuery.error instanceof Error
                  ? usersQuery.error.message
                  : "Unable to load users."
              }
              tone="error"
            />
          ) : null}
          {!usersQuery.isLoading && users.length === 0 ? (
            <StateBlock
              description="Create an account or adjust your search."
              title="No users found"
              tone="empty"
            />
          ) : null}
          {users.map((user) => {
            const active = selectedUser?.userId === user.userId
            return (
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
                  active
                    ? "translate-x-1 border-primary/30 bg-primary/10"
                    : "border-transparent hover:bg-zinc-50",
                )}
                data-testid="admin-user-directory-item"
                key={user.userId}
                onClick={() => {
                  setSelectedId(user.userId)
                  setTemporaryPassword(null)
                }}
                type="button"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-black",
                    active
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {initials(user.fullName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-bold",
                      active ? "text-primary" : "text-zinc-950",
                    )}
                  >
                    {user.fullName}
                  </span>
                  <span className="block truncate text-xs text-zinc-600">
                    {roleLabel(user.role)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      <main className="grid gap-4 lg:col-span-5">
        <div className="grid gap-3 sm:grid-cols-4">
          {metrics.map((metric) => (
            <div
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              key={metric.label}
            >
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-black text-zinc-950">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <section className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-primary to-gym-steel" />
          {selectedUser ? (
            <UserProfileCard user={selectedUser} />
          ) : (
            <StateBlock
              description="Select an account from the directory."
              title="No user selected"
              tone="empty"
            />
          )}
        </section>

        <CreateUserConsole />
      </main>

      <aside className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:col-span-4">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 p-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">
              Role Editor
            </h2>
            <p className="mt-1 text-xs font-medium text-zinc-600">
              Inheriting defaults for{" "}
              <strong className="text-zinc-950">
                {selectedUser ? roleLabel(selectedUser.role) : "selected user"}
              </strong>
            </p>
          </div>
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
        </div>

        {selectedUser ? (
          <UserLifecycleConsole
            onTemporaryPassword={setTemporaryPassword}
            temporaryPassword={temporaryPassword}
            user={selectedUser}
          />
        ) : (
          <StateBlock
            className="m-4"
            description="Pick a user to edit role and lifecycle settings."
            title="No role selected"
            tone="empty"
          />
        )}
      </aside>
    </section>
  )
}

function UserProfileCard({ user }: { user: ManagedUser }) {
  return (
    <div className="pt-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-full border-2 border-[#ecedf7] bg-primary text-2xl font-black text-white">
              {initials(user.fullName)}
            </div>
            <div
              className={cn(
                "absolute bottom-1 right-1 size-4 rounded-full border-2 border-white",
                user.status === "active" ? "bg-primary" : "bg-red-500",
              )}
            />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-950">
              {user.fullName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              <span className="text-xs font-semibold text-zinc-600">
                ID: USR-{user.userId}
              </span>
            </div>
          </div>
        </div>
        <StatusPill status={toStatus(user.status)} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-zinc-50 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
            Email
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
            {user.email}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
            Phone
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
            {user.phone ?? "No phone"}
          </p>
        </div>
      </div>

      <section className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="font-bold text-zinc-950">Workspace & assignments</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
                Primary location
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                Downtown Elite Performance
              </p>
            </div>
            <span className="text-xs font-bold text-primary">Default</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
              {roleLabel(user.role)}
            </span>
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">
              GymMaster OS
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

function CreateUserConsole() {
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
      role: "staff",
    },
  })

  async function onSubmit(values: CreateUserFormValues) {
    try {
      const user = await createUser.mutateAsync({
        ...values,
        password: values.password || undefined,
        phone: values.phone || undefined,
      })
      reset({ email: "", fullName: "", password: "", phone: "", role: "staff" })
      toast.success(`User created: ${user.fullName}`)
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <form
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-4 flex items-center gap-2">
        <UserPlus aria-hidden="true" className="size-5 text-primary" />
        <h2 className="text-lg font-black tracking-tight text-zinc-950">
          Invite user
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field error={errors.fullName?.message} label="Full name">
          <input className={inputClass} data-testid="user-create-name" {...register("fullName")} />
        </Field>
        <Field error={errors.email?.message} label="Email">
          <input className={inputClass} data-testid="user-create-email" type="email" {...register("email")} />
        </Field>
        <Field label="Phone">
          <input className={inputClass} data-testid="user-create-phone" {...register("phone")} />
        </Field>
        <Field error={errors.role?.message} label="Role">
          <select className={inputClass} data-testid="user-create-role" {...register("role")}>
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field error={errors.password?.message} label="Password">
        <input
          className={inputClass}
          data-testid="user-create-password"
          placeholder="Leave blank for temporary password"
          type="password"
          {...register("password")}
        />
      </Field>
      <Button
        className="mt-4 min-h-11 rounded-lg bg-primary text-white hover:brightness-95 active:scale-[0.98]"
        data-testid="user-create-submit"
        disabled={isSubmitting}
        type="submit"
      >
        <UserPlus aria-hidden="true" className="size-4" />
        Invite User
      </Button>
    </form>
  )
}

function UserLifecycleConsole({
  onTemporaryPassword,
  temporaryPassword,
  user,
}: {
  onTemporaryPassword: (value: string | null) => void
  temporaryPassword: string | null
  user: ManagedUser
}) {
  const updateUser = useUpdateManagedUser()
  const updateStatus = useUpdateManagedUserStatus()
  const resetPassword = useResetManagedUserPassword()
  const deleteUser = useDeleteManagedUser()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? "",
      role: user.role === "admin" ? "staff" : user.role,
    },
  })

  useEffect(() => {
    reset({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? "",
      role: user.role === "admin" ? "staff" : user.role,
    })
  }, [reset, user])

  async function onSubmit(values: UpdateUserFormValues) {
    try {
      await updateUser.mutateAsync({
        userId: user.userId,
        input: {
          email: values.email,
          fullName: values.fullName,
          phone: values.phone || undefined,
          role: user.role === "admin" ? undefined : values.role,
        },
      })
      toast.success("User profile updated")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function toggleLock() {
    try {
      await updateStatus.mutateAsync({
        userId: user.userId,
        input: { status: user.status === "locked" ? "active" : "locked" },
      })
      toast.success(user.status === "locked" ? "User unlocked" : "User locked")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function onResetPassword() {
    try {
      const result = await resetPassword.mutateAsync(user.userId)
      onTemporaryPassword(result.temporaryPassword)
      toast.success("Temporary password generated")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function onDelete() {
    try {
      await deleteUser.mutateAsync(user.userId)
      onTemporaryPassword(null)
      toast.success("User deactivated")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <form className="grid gap-3 p-4" onSubmit={handleSubmit(onSubmit)}>
        <Field error={errors.fullName?.message} label="Full name">
          <input className={inputClass} data-testid="user-edit-name" {...register("fullName")} />
        </Field>
        <Field error={errors.email?.message} label="Email">
          <input className={inputClass} data-testid="user-edit-email" type="email" {...register("email")} />
        </Field>
        <Field label="Phone">
          <input className={inputClass} data-testid="user-edit-phone" {...register("phone")} />
        </Field>
        <Field error={errors.role?.message} label="Role">
          <select
            className={inputClass}
            data-testid="user-edit-role"
            disabled={user.role === "admin"}
            {...register("role")}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
        </Field>

        <section className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
            Client management
          </h3>
          <div className="mt-3 grid gap-2">
            {[
              "View member profiles",
              "Edit workout plans",
              "Record front desk operations",
            ].map((permission, index) => (
              <label className="flex items-start gap-3" key={permission}>
                <span className="mt-0.5 flex size-4 items-center justify-center rounded border border-primary bg-primary text-white">
                  {index < 2 ? <Check aria-hidden="true" className="size-3" /> : null}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-zinc-950">
                    {permission}
                  </span>
                  <span className="block text-xs text-zinc-600">
                    Derived from {roleLabel(user.role)} role defaults.
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <Button
          className="min-h-11 rounded-lg bg-primary text-white hover:brightness-95 active:scale-[0.98]"
          data-testid="user-edit-submit"
          disabled={isSubmitting || updateUser.isPending}
          type="submit"
        >
          Save Changes
        </Button>
      </form>

      <div className="mt-auto grid gap-2 border-t border-zinc-200 bg-zinc-50 p-4">
        {temporaryPassword ? (
          <p className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 font-mono text-xs font-bold text-foreground">
            Temporary password: {temporaryPassword}
          </p>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            className="min-h-10 rounded-lg border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 active:scale-[0.98]"
            data-testid="user-toggle-lock-button"
            disabled={updateStatus.isPending || user.role === "admin"}
            onClick={toggleLock}
            type="button"
            variant="outline"
          >
            {user.status === "locked" ? (
              <Unlock aria-hidden="true" className="size-4" />
            ) : (
              <Lock aria-hidden="true" className="size-4" />
            )}
            {user.status === "locked" ? "Unlock" : "Lock"}
          </Button>
          <Button
            className="min-h-10 rounded-lg border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 active:scale-[0.98]"
            data-testid="user-reset-password-button"
            disabled={resetPassword.isPending || user.role === "admin"}
            onClick={onResetPassword}
            type="button"
            variant="outline"
          >
            <KeyRound aria-hidden="true" className="size-4" />
            Reset
          </Button>
          <Button
            className="min-h-10 rounded-lg"
            data-testid="user-delete-button"
            disabled={deleteUser.isPending || user.role === "admin"}
            onClick={onDelete}
            type="button"
            variant="destructive"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
