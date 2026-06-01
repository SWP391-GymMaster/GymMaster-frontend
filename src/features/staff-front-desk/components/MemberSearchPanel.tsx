"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"
import { useStaffMemberSearch } from "@/features/staff-front-desk/api/staff-front-desk.queries"
import { staffSearchSchema } from "@/features/staff-front-desk/schemas/staff-front-desk.schemas"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"
import { toStatusPillStatus } from "@/features/staff-front-desk/utils/staff-status"

export function MemberSearchPanel() {
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [validationMessage, setValidationMessage] = useState("")
  const search = useStaffMemberSearch(submittedQuery)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = staffSearchSchema.safeParse({ query })

    if (!parsed.success) {
      setValidationMessage(parsed.error.issues[0]?.message ?? "Invalid search.")
      return
    }

    setValidationMessage("")
    setSubmittedQuery(parsed.data.query)
  }

  const error = search.error ? mapStaffOperationError(search.error) : null
  const hasSearched = submittedQuery.length >= 2

  return (
    <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
      <form className="flex flex-col gap-3 md:flex-row" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="staff-member-search">
          Search member
        </label>
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400"
          />
          <input
            className="min-h-12 w-full rounded-full border border-zinc-200 bg-white pl-12 pr-4 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            data-testid="staff-member-search-input"
            id="staff-member-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, email, phone, or member code"
            value={query}
          />
        </div>
        <Button
          className="min-h-12 rounded-full bg-zinc-950 px-6 text-white hover:bg-zinc-800"
          data-testid="staff-member-search-button"
          type="submit"
        >
          Search
        </Button>
      </form>

      {validationMessage ? (
        <p className="mt-3 text-sm font-medium text-red-700">{validationMessage}</p>
      ) : null}

      <div className="mt-5">
        {search.isLoading ? (
          <StateBlock
            description="Matching active member records against backend member contracts."
            title="Loading member matches..."
            tone="loading"
          />
        ) : null}

        {error ? (
          <StateBlock
            description="Try again or verify the lookup value before continuing."
            title={error.message}
            tone="error"
          />
        ) : null}

        {hasSearched && search.data?.items.length === 0 ? (
          <StateBlock
            description="Check the spelling or create a new member from the approved Staff workflow."
            title="No member found."
            tone="empty"
          />
        ) : null}

        {search.data?.items.length ? (
          <div className="grid gap-3">
            {search.data.items.map((member) => (
              <Link
                className="flex flex-col gap-3 rounded-[1.25rem] border border-zinc-200 bg-white p-4 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:scale-[0.97] md:flex-row md:items-center md:justify-between"
                data-testid="staff-member-result"
                href={staffRoutes.memberDetail(member.id)}
                key={member.id}
              >
                <span>
                  <span className="block text-base font-semibold text-zinc-950">
                    {member.fullName}
                  </span>
                  <span className="mt-1 block text-sm text-zinc-600">
                    {member.memberCode} · {member.phone} · {member.email}
                  </span>
                  <span className="mt-1 block text-sm text-zinc-500">
                    {member.currentPackageName ?? "No current package"}
                    {member.membershipEndsAt ? ` · Ends ${member.membershipEndsAt}` : ""}
                  </span>
                </span>
                <StatusPill status={toStatusPillStatus(member.membershipStatus)} />
              </Link>
            ))}
          </div>
        ) : null}

        {!hasSearched ? (
          <StateBlock
            description="Results use backend/MSW member contracts."
            title="Search starts after two characters."
            tone="empty"
          />
        ) : null}
      </div>
    </section>
  )
}
