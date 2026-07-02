"use client"

import { CalendarDays, Filter, RotateCcw, Search } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const AUDIT_ACTIONS = [
  "",
  "MEMBER_CHECK_IN",
  "SELL_MEMBERSHIP",
  "MEMBERSHIP_RENEWAL",
  "MEMBERSHIP_PAYMENT_CONFIRMED",
  "ASSIGN_PT",
  "CREATE_WORKOUT_PLAN",
  "ADD_TRAINER_NOTE",
  "CREATE_STAFF_ACCOUNT",
  "LOCK_MEMBER_ACCOUNT",
  "UPDATE_PACKAGE",
] as const

export type AuditLogFilterValues = {
  action: string
  from: string
  to: string
  search: string
}

type AuditLogFiltersProps = {
  onApply: (values: AuditLogFilterValues) => void
  isLoading?: boolean
}

export function AuditLogFilters({ onApply, isLoading }: AuditLogFiltersProps) {
  const [action, setAction] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [search, setSearch] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply({ action, from, to, search })
  }

  function handleReset() {
    setAction("")
    setFrom("")
    setTo("")
    setSearch("")
    onApply({ action: "", from: "", to: "", search: "" })
  }

  return (
    <form
      className="gm-panel p-5"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            htmlFor="audit-action"
          >
            Loại thao tác
          </label>
          
          {/* Visually hidden native select for Playwright test compatibility */}
          <select
            id="audit-action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            {AUDIT_ACTIONS.map((act) => (
              <option key={act} value={act}>
                {act ? act.replace(/_/g, " ") : "Tất cả"}
              </option>
            ))}
          </select>

          <Select
            value={action || "all"}
            onValueChange={(val) => setAction(val === "all" ? "" : val)}
          >
            <SelectTrigger className="gm-field min-h-11 w-full px-3 text-sm text-foreground">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
              {AUDIT_ACTIONS.map((act) => (
                <SelectItem key={act || "all"} value={act || "all"} className="focus:bg-white/5 focus:text-white">
                  {act ? act.replace(/_/g, " ") : "Tất cả"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            htmlFor="audit-from"
          >
            Từ ngày
          </label>
          <div className="relative">
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="gm-field min-h-11 w-full px-3 pr-10 text-sm text-foreground transition"
              id="audit-from"
              onChange={(event) => setFrom(event.target.value)}
              type="date"
              value={from}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            htmlFor="audit-to"
          >
            Đến ngày
          </label>
          <div className="relative">
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="gm-field min-h-11 w-full px-3 pr-10 text-sm text-foreground transition"
              id="audit-to"
              onChange={(event) => setTo(event.target.value)}
              type="date"
              value={to}
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button
            className="min-h-11 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90"
            disabled={isLoading}
            type="submit"
          >
            <Filter aria-hidden="true" className="size-4" />
            Lọc
          </Button>
          <Button
            className="min-h-11 rounded-full border-border bg-[var(--surface-panel)] text-foreground hover:bg-muted"
            onClick={handleReset}
            type="button"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Đặt lại
          </Button>
        </div>
      </div>

      <label className="relative mt-4 block">
        <span className="sr-only">Tìm kiếm trong audit log</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="gm-field min-h-11 w-full pl-11 pr-3 text-sm text-foreground transition placeholder:text-muted-foreground"
          placeholder="Tìm theo tên, hành động, đối tượng, ID..."
          onChange={(event) => setSearch(event.target.value)}
          value={search}
        />
      </label>
    </form>
  )
}
