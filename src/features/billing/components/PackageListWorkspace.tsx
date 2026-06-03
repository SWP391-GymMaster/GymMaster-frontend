"use client"

import { useState } from "react"
import { Plus, Search, Edit2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { PackageEditorDialog } from "@/features/billing/components/PackageEditorDialog"
import { usePackages } from "@/features/billing/api/billing.queries"
import type { GymPackage } from "@/features/billing/types/billing.types"

export function PackageListWorkspace() {
  const { data: packages, isLoading, error } = usePackages()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">("all")
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<GymPackage | undefined>(undefined)

  const handleCreateNew = () => {
    setEditingPackage(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (pkg: GymPackage) => {
    setEditingPackage(pkg)
    setIsDialogOpen(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const filteredPackages = (packages ?? []).filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || pkg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="min-h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
              placeholder="Tìm kiếm gói tập..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="package-search-input"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "locked")}
              data-testid="package-status-filter"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động (Active)</option>
              <option value="locked">Khóa (Locked)</option>
            </select>
          </div>
        </div>

        <Button
          className="min-h-11 rounded-full bg-primary px-6 text-primary-foreground hover:brightness-95 active:scale-[0.98]"
          onClick={handleCreateNew}
          data-testid="package-add-button"
        >
          <Plus className="size-4 mr-2" />
          Thêm gói tập mới
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <StateBlock tone="loading" title="Đang tải danh sách gói tập..." />
      ) : error ? (
        <StateBlock
          tone="error"
          title="Lỗi tải dữ liệu gói tập"
          description={error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định."}
        />
      ) : filteredPackages.length === 0 ? (
        <StateBlock
          tone="empty"
          title="Không tìm thấy gói tập"
          description="Không có gói tập nào phù hợp với bộ lọc hiện tại của bạn."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group flex flex-col justify-between rounded-[1.5rem] border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              data-testid={`package-card-${pkg.id}`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">{pkg.name}</h3>
                  <StatusPill status={pkg.status} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thời hạn:</span>
                    <span className="font-semibold text-foreground">{pkg.durationDays} ngày</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mã gói:</span>
                    <span className="font-mono text-zinc-600">GP-{pkg.id}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-extrabold tracking-tight text-primary">
                    {formatPrice(pkg.price)}
                  </span>
                  <Button
                    variant="outline"
                    className="min-h-10 rounded-xl"
                    onClick={() => handleEdit(pkg)}
                    data-testid={`package-edit-${pkg.id}`}
                  >
                    <Edit2 className="size-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <PackageEditorDialog
        gymPackage={editingPackage}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
