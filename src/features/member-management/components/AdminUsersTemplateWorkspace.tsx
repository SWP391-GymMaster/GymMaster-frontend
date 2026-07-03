"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  Check,
  ChevronRight,
  KeyRound,
  Lock,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { RoleBadge } from "@/components/data/RoleBadge"
import { StatusPill } from "@/components/data/StatusPill"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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

const roles = ["staff", "admin"] as const

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function roleLabel(role: ManagedUser["role"]) {
  if (role === "pt") return "Huáº¥n luyá»‡n viÃªn"
  if (role === "staff") return "Lá»… tÃ¢n"
  if (role === "member") return "Há»™i viÃªn"
  if (role === "admin") return "Quáº£n trá»‹ viÃªn"
  return role
}

function isOperationalRole(role: ManagedUser["role"]): role is "staff" | "admin" {
  return role === "staff" || role === "admin"
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
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-sm font-medium text-destructive">{error}</span>
      ) : null}
    </label>
  )
}

const inputClass =
  "gm-field min-h-11 w-full px-3 text-sm text-foreground transition-all placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"

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
      {
        icon: UsersRound,
        label: "Tá»•ng ngÆ°á»i dÃ¹ng",
        helper: "Táº¥t cáº£ tÃ i khoáº£n",
        value: String(usersQuery.data?.total ?? 0),
      },
      {
        icon: UserCheck,
        label: "Äang hoáº¡t Ä‘á»™ng",
        helper: "Sáºµn sÃ ng truy cáº­p",
        value: String(active),
      },
      {
        icon: Lock,
        label: "ÄÃ£ khÃ³a",
        helper: "Cáº§n kiá»ƒm tra",
        value: String(locked),
      },
      {
        icon: UserCog,
        label: "Huáº¥n luyá»‡n viÃªn",
        helper: "TÃ i khoáº£n PT",
        value: String(trainers),
      },
    ]
  }, [users, usersQuery.data?.total])

  return (
    <section className="space-y-6">
      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="User management metrics"
      >
        {metrics.map((metric) => (
          <UserMetricCard
            helper={metric.helper}
            icon={metric.icon}
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>

      <div className="grid min-h-[calc(100dvh-320px)] gap-6 xl:grid-cols-[minmax(360px,0.92fr)_minmax(0,1.28fr)]">
        <aside className="gm-panel flex min-h-[720px] flex-col overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Danh sÃ¡ch ngÆ°á»i dÃ¹ng
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  TÃ i khoáº£n há»‡ thá»‘ng
                </h2>
              </div>
              <CreateUserDialog />
            </div>

            <label className="relative mt-5 block">
              <span className="sr-only">TÃ¬m kiáº¿m ngÆ°á»i dÃ¹ng</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="gm-field min-h-11 w-full pl-11 pr-3 text-sm text-foreground transition placeholder:text-muted-foreground"
                data-testid="admin-user-search-input"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="TÃ¬m theo tÃªn, email..."
                value={query}
              />
            </label>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {usersQuery.isLoading ? (
              <StateBlock title="Äang táº£i ngÆ°á»i dÃ¹ng..." tone="loading" />
            ) : null}
            {usersQuery.error ? (
              <StateBlock
                title={
                  usersQuery.error instanceof Error
                    ? usersQuery.error.message
                    : "KhÃ´ng thá»ƒ táº£i danh sÃ¡ch ngÆ°á»i dÃ¹ng."
                }
                tone="error"
              />
            ) : null}
            {!usersQuery.isLoading && users.length === 0 ? (
              <StateBlock
                description="Táº¡o tÃ i khoáº£n má»›i hoáº·c Ä‘iá»u chá»‰nh tá»« khÃ³a tÃ¬m kiáº¿m."
                title="KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"
                tone="empty"
              />
            ) : null}
            {users.map((user) => {
              const active = selectedUser?.userId === user.userId

              return (
                <button
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
                    active
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-transparent hover:border-border hover:bg-muted/40",
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
                      "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {initials(user.fullName)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm font-semibold",
                        active ? "text-primary" : "text-foreground",
                      )}
                    >
                      {user.fullName}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {roleLabel(user.role)}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      user.status === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {user.status === "active" ? "Äang hoáº¡t Ä‘á»™ng" : "ÄÃ£ khÃ³a"}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition",
                      active ? "translate-x-0.5 text-primary" : "group-hover:translate-x-0.5",
                    )}
                  />
                </button>
              )
            })}
          </div>
        </aside>

        <main className="min-w-0">
          <section className="gm-panel h-full overflow-hidden">
            {selectedUser ? (
              <UserDetailPanel
                onTemporaryPassword={setTemporaryPassword}
                temporaryPassword={temporaryPassword}
                user={selectedUser}
              />
            ) : (
              <StateBlock
                className="m-6"
                description="Chá»n má»™t tÃ i khoáº£n tá»« danh sÃ¡ch Ä‘á»ƒ xem há»“ sÆ¡."
                title="ChÆ°a chá»n ngÆ°á»i dÃ¹ng"
                tone="empty"
              />
            )}
          </section>
        </main>
      </div>
    </section>
  )
}

function UserMetricCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="gm-panel relative overflow-hidden p-5">
      <div className="absolute -right-5 bottom-0 size-20 rounded-full bg-primary/5" />
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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


function CreateUserDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="min-h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:brightness-95 active:scale-[0.98]" data-testid="user-create-open">
          <UserPlus aria-hidden="true" className="size-4" />
          ThÃªm ngÆ°á»i dÃ¹ng
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-2xl border-border p-0">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Táº¡o tÃ i khoáº£n há»‡ thá»‘ng
          </DialogTitle>
          <DialogDescription>
            ThÃªm nhÃ¢n sá»±, PT hoáº·c há»™i viÃªn. Vai trÃ² Ä‘Æ°á»£c lÆ°u vÃ o há»“ sÆ¡ tÃ i khoáº£n,
            khÃ´ng chá»n á»Ÿ mÃ n Ä‘Äƒng nháº­p.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <CreateUserForm onCreated={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateUserForm({ onCreated }: { onCreated?: () => void }) {
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
      onCreated?.()
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.fullName?.message} label="Há» vÃ  tÃªn">
          <Input
            className={inputClass}
            data-testid="user-create-name"
            {...register("fullName")}
          />
        </Field>
        <Field error={errors.email?.message} label="Email">
          <Input
            className={inputClass}
            data-testid="user-create-email"
            type="email"
            {...register("email")}
          />
        </Field>
        <Field label="Sá»‘ Ä‘iá»‡n thoáº¡i">
          <Input
            className={inputClass}
            data-testid="user-create-phone"
            {...register("phone")}
          />
        </Field>
        <Field error={errors.role?.message} label="Vai trÃ²">
          {/* Visually hidden native select for Playwright test compatibility & React Hook Form registration */}
          <select
            className="sr-only"
            data-testid="user-create-role"
            {...register("role")}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>

          <Select
            value={watch("role")}
            onValueChange={(val: string) => setValue("role", val as "staff" | "admin", { shouldValidate: true })}
          >
            <SelectTrigger className="min-h-11 w-full bg-background border border-border rounded-xl px-3 text-sm text-foreground focus-visible:ring-primary/20 focus-visible:border-primary">
              <SelectValue placeholder="Chá»n vai trÃ²" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
              {roles.map((role) => (
                <SelectItem key={role} value={role} className="focus:bg-white/5 focus:text-white">
                  {roleLabel(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs leading-5 text-muted-foreground">Man nay chi tao tai khoan van hanh (Le tan/Quan tri vien). Hoi vien tao o man Hoi vien, PT tao o man Huan luyen vien.</p>
        </Field>
      </div>

      <div className="mt-4">
        <Field error={errors.password?.message} label="Máº­t kháº©u">
          <Input
            className={inputClass}
            data-testid="user-create-password"
            placeholder="Äá»ƒ trá»‘ng Ä‘á»ƒ táº¡o máº­t kháº©u táº¡m"
            type="password"
            {...register("password")}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <DialogTrigger asChild>
          <Button
            className="rounded-xl"
            type="button"
            variant="outline"
          >
            Há»§y
          </Button>
        </DialogTrigger>
        <Button
          className="min-h-11 rounded-xl bg-primary px-5 text-primary-foreground hover:brightness-95 active:scale-[0.98]"
          data-testid="user-create-submit"
          disabled={isSubmitting || createUser.isPending}
          type="submit"
        >
          <UserPlus aria-hidden="true" className="size-4" />
          Táº¡o tÃ i khoáº£n
        </Button>
      </div>
    </form>
  )
}


function UserSecurityPanel({
  onTemporaryPassword,
  temporaryPassword,
  user,
}: {
  onTemporaryPassword: (value: string | null) => void
  temporaryPassword: string | null
  user: ManagedUser
}) {
  const updateStatus = useUpdateManagedUserStatus()
  const resetPassword = useResetManagedUserPassword()
  const deleteUser = useDeleteManagedUser()

  async function toggleLock() {
    try {
      await updateStatus.mutateAsync({
        userId: user.userId,
        input: { status: user.status === "locked" ? "active" : "locked" },
      })
      toast.success(user.status === "locked" ? "ÄÃ£ má»Ÿ khÃ³a tÃ i khoáº£n" : "ÄÃ£ khÃ³a tÃ i khoáº£n")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function onResetPassword() {
    try {
      const result = await resetPassword.mutateAsync(user.userId)
      onTemporaryPassword(result.temporaryPassword)
      toast.success("ÄÃ£ táº¡o máº­t kháº©u táº¡m thá»i")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  async function onDelete() {
    try {
      await deleteUser.mutateAsync(user.userId)
      onTemporaryPassword(null)
      toast.success("ÄÃ£ vÃ´ hiá»‡u hÃ³a tÃ i khoáº£n")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="gm-panel-muted p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Báº£o máº­t tÃ i khoáº£n
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              KhÃ³a tÃ i khoáº£n khi cáº§n táº¡m dá»«ng truy cáº­p, hoáº·c táº¡o máº­t kháº©u táº¡m
              Ä‘á»ƒ há»— trá»£ ngÆ°á»i dÃ¹ng Ä‘Äƒng nháº­p láº¡i.
            </p>
          </div>
        </div>

        {temporaryPassword ? (
          <p className="mt-5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 font-mono text-xs font-semibold text-foreground">
            Máº­t kháº©u táº¡m thá»i: {temporaryPassword}
          </p>
        ) : null}
      </section>

      <aside className="grid gap-2">
        <Button
          className="min-h-11 justify-start rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
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
          {user.status === "locked" ? "Má»Ÿ khÃ³a tÃ i khoáº£n" : "KhÃ³a tÃ i khoáº£n"}
        </Button>

        <Button
          className="min-h-11 justify-start rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
          data-testid="user-reset-password-button"
          disabled={resetPassword.isPending || user.role === "admin"}
          onClick={onResetPassword}
          type="button"
          variant="outline"
        >
          <KeyRound aria-hidden="true" className="size-4" />
          Äáº·t láº¡i máº­t kháº©u
        </Button>

        <Button
          className="min-h-11 justify-start rounded-xl"
          data-testid="user-delete-button"
          disabled={deleteUser.isPending || user.role === "admin"}
          onClick={onDelete}
          type="button"
          variant="destructive"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          XÃ³a tÃ i khoáº£n
        </Button>
      </aside>
    </div>
  )
}


function UserDetailPanel({
  onTemporaryPassword,
  temporaryPassword,
  user,
}: {
  onTemporaryPassword: (value: string | null) => void
  temporaryPassword: string | null
  user: ManagedUser
}) {
  return (
    <div className="flex h-full flex-col">
      <UserDetailHeader user={user} />

      <Tabs className="h-full" defaultValue="profile">
        <div className="border-b border-border px-6 pt-5">
          <TabsList className="h-auto gap-7 rounded-none bg-transparent p-0">
            <TabsTrigger
              className="rounded-none border-b-2 border-transparent bg-transparent px-2 pb-0 rounded-t-lg pt-0 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              value="profile"
            >
              ThÃ´ng tin chung
            </TabsTrigger>
            {/* <TabsTrigger
              className="rounded-none border-b-2 border-transparent bg-transparent px-0 pb-0 rounded-t-lg pt-0 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              value="access"
            >
              Quyá»n háº¡n
            </TabsTrigger> */}
            <TabsTrigger
              className="rounded-none border-b-2 border-transparent bg-transparent px-2 pb-0 rounded-t-lg pt-0 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              value="security"
            >
              Báº£o máº­t
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="m-0" value="profile">
          <UserProfileForm user={user} />
        </TabsContent>

        <TabsContent className="m-0 p-6" value="access">
          <UserAccessPanel user={user} />
        </TabsContent>

        <TabsContent className="m-0 p-6" value="security">
          <UserSecurityPanel
            onTemporaryPassword={onTemporaryPassword}
            temporaryPassword={temporaryPassword}
            user={user}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UserDetailHeader({ user }: { user: ManagedUser }) {
  return (
    <div className="relative overflow-hidden border-b border-border bg-[var(--surface-panel)] p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 size-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 size-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-2xl font-semibold text-primary shadow-sm">
              {initials(user.fullName)}
            </div>
            <div
              className={cn(
                "absolute bottom-1 right-1 size-4 rounded-full border-2 border-card",
                user.status === "active" ? "bg-primary" : "bg-destructive",
              )}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                {user.fullName}
              </h2>
              <StatusPill status={toStatus(user.status)} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              <span className="text-sm font-medium text-muted-foreground">
                {roleLabel(user.role)}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              ID: USR-{user.userId} Â· Há»“ sÆ¡ tÃ i khoáº£n há»‡ thá»‘ng
            </p>
          </div>
        </div>

        {/* <button
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          type="button"
        >
          <MoreVertical aria-hidden="true" className="size-4" />
          <span className="sr-only">TÃ¹y chá»n ngÆ°á»i dÃ¹ng</span>
        </button> */}
      </div>
    </div>
  )
}

function UserProfileForm({ user }: { user: ManagedUser }) {
  const updateUser = useUpdateManagedUser()
  const updateStatus = useUpdateManagedUserStatus()
  const canEditPersonalProfile = isOperationalRole(user.role)

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
      dateOfBirth: toDateInputValue(user.dateOfBirth),
      gender: user.gender ?? "",
      address: user.address ?? "",
      emergencyContact: user.emergencyContact ?? "",
    },
  })

  useEffect(() => {
    reset({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? "",
      dateOfBirth: toDateInputValue(user.dateOfBirth),
      gender: user.gender ?? "",
      address: user.address ?? "",
      emergencyContact: user.emergencyContact ?? "",
    })
  }, [reset, user.address, user.dateOfBirth, user.email, user.emergencyContact, user.fullName, user.gender, user.phone, user.userId])

  async function onSubmit(values: UpdateUserFormValues) {
    try {
      await updateUser.mutateAsync({
        userId: user.userId,
        input: {
          email: values.email,
          fullName: values.fullName,
          phone: values.phone || undefined,
          dateOfBirth: canEditPersonalProfile ? values.dateOfBirth || undefined : undefined,
          gender: canEditPersonalProfile ? values.gender || undefined : undefined,
          address: canEditPersonalProfile ? values.address || undefined : undefined,
          emergencyContact: canEditPersonalProfile ? values.emergencyContact || undefined : undefined,
        },
      })
      toast.success("Da cap nhat thong tin nguoi dung")
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
      toast.success(user.status === "locked" ? "Da mo khoa tai khoan" : "Da khoa tai khoan")
    } catch (error) {
      toast.error(mapMemberManagementError(error).message)
    }
  }

  return (
    <form className="flex h-full flex-col p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Field error={errors.fullName?.message} label="Ho va ten">
          <Input className={inputClass} data-testid="user-edit-name" {...register("fullName")} />
        </Field>

        <Field label="Vai tro">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              <span className="text-sm font-semibold text-foreground">Tai khoan {roleLabel(user.role)}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Vai tro duoc gan khi tao tai khoan va khong the thay doi. Muon doi vai tro: tao tai khoan moi o man tuong ung va khoa/xoa tai khoan cu.
            </p>
          </div>
        </Field>

        <Field error={errors.email?.message} label="Email">
          <Input className={inputClass} data-testid="user-edit-email" type="email" {...register("email")} />
        </Field>

        <Field label="So dien thoai">
          <Input className={inputClass} data-testid="user-edit-phone" {...register("phone")} />
        </Field>

        {canEditPersonalProfile ? (
          <>
            <Field label="Ngay sinh">
              <Input className={inputClass} type="date" {...register("dateOfBirth")} />
            </Field>
            <Field label="Gioi tinh">
              <Input className={inputClass} {...register("gender")} />
            </Field>
            <Field label="Dia chi">
              <Input className={inputClass} {...register("address")} />
            </Field>
            <Field label="Lien he khan cap">
              <Input className={inputClass} {...register("emergencyContact")} />
            </Field>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 p-3 lg:col-span-2">
            <p className="text-xs leading-5 text-muted-foreground">
              Ho so ca nhan cua {user.role === "member" ? "Hoi vien" : "Huan luyen vien"} duoc quan ly o man tuong ung.
            </p>
          </div>
        )}

        <Field label="Trang thai">
          <Input className={inputClass} readOnly value={user.status === "active" ? "Dang hoat dong" : "Da khoa"} />
        </Field>

        <Field label="Ma tai khoan">
          <Input className={inputClass} readOnly value={`USR-${user.userId}`} />
        </Field>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          className={cn(
            "min-h-11 rounded-xl px-5 active:scale-[0.98]",
            user.status === "locked"
              ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
              : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
          )}
          data-testid="user-toggle-lock-button"
          disabled={updateStatus.isPending || user.role === "admin"}
          onClick={toggleLock}
          type="button"
          variant="outline"
        >
          {user.status === "locked" ? <Unlock aria-hidden="true" className="size-4" /> : <Lock aria-hidden="true" className="size-4" />}
          {user.status === "locked" ? "Mo khoa tai khoan" : "Khoa tai khoan"}
        </Button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            className="min-h-11 rounded-xl px-6"
            onClick={() =>
              reset({
                email: user.email,
                fullName: user.fullName,
                phone: user.phone ?? "",
                dateOfBirth: toDateInputValue(user.dateOfBirth),
                gender: user.gender ?? "",
                address: user.address ?? "",
                emergencyContact: user.emergencyContact ?? "",
              })
            }
            type="button"
            variant="outline"
          >
            Huy
          </Button>

          <Button
            className="min-h-11 rounded-xl bg-primary px-6 text-primary-foreground hover:brightness-95 active:scale-[0.98]"
            data-testid="user-edit-submit"
            disabled={isSubmitting || updateUser.isPending}
            type="submit"
          >
            Luu thay doi
          </Button>
        </div>
      </div>
    </form>
  )
}
function toDateInputValue(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}
function UserAccessPanel({ user }: { user: ManagedUser }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="gm-panel-muted p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Quyá»n theo vai trÃ² {roleLabel(user.role)}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              CÃ¡c quyá»n bÃªn dÆ°á»›i Ä‘Æ°á»£c káº¿ thá»«a tá»« vai trÃ² tÃ i khoáº£n. NgÆ°á»i dÃ¹ng
              sáº½ Ä‘Æ°á»£c Ä‘iá»u hÆ°á»›ng vÃ o workspace tÆ°Æ¡ng á»©ng sau khi Ä‘Äƒng nháº­p.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {[
            "Xem há»“ sÆ¡ há»™i viÃªn",
            "Cáº­p nháº­t workout plan",
            "Ghi nháº­n thao tÃ¡c váº­n hÃ nh",
          ].map((permission, index) => (
            <label
              className="gm-panel-muted flex items-start gap-3 p-4"
              key={permission}
            >
              <span className="mt-0.5 flex size-5 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground">
                {index < 2 ? <Check aria-hidden="true" className="size-3.5" /> : null}
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {permission}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Theo quyá»n máº·c Ä‘á»‹nh cá»§a {roleLabel(user.role)}.
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <aside className="rounded-xl border border-border bg-muted/25 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Workspace
        </p>
        <p className="mt-2 text-lg font-semibold text-foreground">
          {roleLabel(user.role)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Role Ä‘Æ°á»£c lÆ°u trong há»“ sÆ¡ tÃ i khoáº£n. MÃ n Ä‘Äƒng nháº­p khÃ´ng cho ngÆ°á»i dÃ¹ng
          tá»± chá»n vai trÃ².
        </p>
      </aside>
    </div>
  )
}
