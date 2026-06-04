"use client";

import { useState } from "react";
import { Plus, Search, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/data/StatusPill";
import { StateBlock } from "@/components/feedback/StateBlock";
import { PackageEditorDialog } from "@/features/billing/components/PackageEditorDialog";
import { usePackages } from "@/features/billing/api/billing.queries";
import type { GymPackage } from "@/features/billing/types/billing.types";

export function PackageListWorkspace() {
  const { data: packages, isLoading, error } = usePackages();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">(
    "all",
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<GymPackage | undefined>(
    undefined,
  );

  const handleCreateNew = () => {
    setEditingPackage(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (pkg: GymPackage) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredPackages = (packages ?? []).filter((pkg) => {
    const matchesSearch = pkg.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <Input
              className="min-h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"
              placeholder="Tìm kiếm gói tập..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="package-search-input"
            />
          </div>

          <div className="w-full sm:w-48">
            {/* Visually hidden native select for Playwright test compatibility */}
            <select
              id="package-status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "locked")
              }
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              data-testid="package-status-filter"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động (Active)</option>
              <option value="locked">Khóa (Locked)</option>
            </select>

            <Select
              value={statusFilter}
              onValueChange={(val: string) => setStatusFilter(val as "all" | "active" | "locked")}
            >
              <SelectTrigger className="min-h-11 w-full bg-background border border-border rounded-xl px-3 text-sm text-foreground focus-visible:ring-primary/20 focus-visible:border-primary">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
                <SelectItem value="all" className="focus:bg-white/5 focus:text-white">Tất cả trạng thái</SelectItem>
                <SelectItem value="active" className="focus:bg-white/5 focus:text-white">Hoạt động (Active)</SelectItem>
                <SelectItem value="locked" className="focus:bg-white/5 focus:text-white">Khóa (Locked)</SelectItem>
              </SelectContent>
            </Select>
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
          description={
            error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi không xác định."
          }
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
              className="group flex flex-col justify-between rounded-[1.5rem] border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              data-testid={`package-card-${pkg.id}`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {pkg.name}
                  </h3>
                  <StatusPill status={pkg.status} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thời hạn:</span>
                    <span className="font-semibold text-foreground">
                      {pkg.durationDays} ngày
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mã gói:</span>
                    <span className="font-mono text-muted">GP-{pkg.id}</span>
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
  );
}
