"use client"
/* eslint-disable react-hooks/incompatible-library */

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import type { AuditLogEntry } from "@/features/admin-dashboard/types/admin-dashboard.types"

const columnHelper = createColumnHelper<AuditLogEntry>()

const columns = [
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <button
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.08em] text-zinc-500"
        onClick={() => column.toggleSorting()}
        type="button"
      >
        Time
        <ArrowUpDown className="size-3" />
      </button>
    ),
    cell: (info) => {
      const raw = info.getValue()
      const date = new Date(raw)
      return (
        <span className="text-sm text-zinc-600">
          {date.toLocaleDateString("en-GB")}{" "}
          {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </span>
      )
    },
  }),
  columnHelper.accessor("userDisplayName", {
    header: "Actor",
    cell: (info) => (
      <span className="text-sm font-medium text-zinc-900">
        {info.getValue() ?? `User #${info.row.original.userId}`}
      </span>
    ),
  }),
  columnHelper.accessor("action", {
    header: "Action",
    cell: (info) => {
      const action = info.getValue()
      return (
        <span className="inline-flex rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-800">
          {action.replace(/_/g, " ")}
        </span>
      )
    },
  }),
  columnHelper.accessor("entityType", {
    header: "Entity",
    cell: (info) => (
      <span className="text-sm capitalize text-zinc-600">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("entityId", {
    header: "ID",
    cell: (info) => (
      <span className="text-sm text-zinc-500">#{info.getValue()}</span>
    ),
  }),
]

type AuditLogTableProps = {
  data: AuditLogEntry[]
  isLoading?: boolean
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function AuditLogTable({
  data,
  isLoading,
  page,
  total,
  pageSize,
  onPageChange,
}: AuditLogTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-[1.25rem] border border-zinc-200 bg-white p-4"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-12 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
        No audit logs found for the selected filters.
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-2">
        {table.getRowModel().rows.map((row) => (
          <div
            className="rounded-[1.25rem] border border-zinc-200 bg-white p-4 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-md"
            key={row.id}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages} ({total} entries)
          </p>
          <div className="flex gap-2">
            <button
              className="inline-flex min-h-9 items-center rounded-full border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-100 active:scale-[0.97] disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              type="button"
            >
              Previous
            </button>
            <button
              className="inline-flex min-h-9 items-center rounded-full border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-100 active:scale-[0.97] disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
