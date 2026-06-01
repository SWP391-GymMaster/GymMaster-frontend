"use client"

import { Search } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"

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
}

type AuditLogFiltersProps = {
  onApply: (values: AuditLogFilterValues) => void
  isLoading?: boolean
}

export function AuditLogFilters({ onApply, isLoading }: AuditLogFiltersProps) {
  const [action, setAction] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply({ action, from, to })
  }

  function handleReset() {
    setAction("")
    setFrom("")
    setTo("")
    onApply({ action: "", from: "", to: "" })
  }

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-sm"
      onSubmit={handleSubmit}
    >
      {/* Action filter */}
      <div className="space-y-1">
        <label
          className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500"
          htmlFor="audit-action"
        >
          Action
        </label>
        <select
          className="min-h-10 rounded-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          id="audit-action"
          onChange={(e) => setAction(e.target.value)}
          value={action}
        >
          {AUDIT_ACTIONS.map((act) => (
            <option key={act} value={act}>
              {act ? act.replace(/_/g, " ") : "All actions"}
            </option>
          ))}
        </select>
      </div>

      {/* From date */}
      <div className="space-y-1">
        <label
          className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500"
          htmlFor="audit-from"
        >
          From
        </label>
        <input
          className="min-h-10 rounded-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          id="audit-from"
          onChange={(e) => setFrom(e.target.value)}
          type="date"
          value={from}
        />
      </div>

      {/* To date */}
      <div className="space-y-1">
        <label
          className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500"
          htmlFor="audit-to"
        >
          To
        </label>
        <input
          className="min-h-10 rounded-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          id="audit-to"
          onChange={(e) => setTo(e.target.value)}
          type="date"
          value={to}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button
          className="min-h-10 rounded-full bg-zinc-950 px-4 text-white hover:bg-zinc-800"
          disabled={isLoading}
          size="sm"
          type="submit"
        >
          <Search aria-hidden="true" className="size-4" />
          Filter
        </Button>
        <Button
          className="min-h-10 rounded-full border border-zinc-200 bg-white px-4 text-zinc-700 hover:bg-zinc-100"
          onClick={handleReset}
          size="sm"
          type="button"
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
