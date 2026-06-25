"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { toast } from "sonner"

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
  packageFormSchema,
  type PackageFormInput,
  type PackageFormValues,
} from "@/features/billing/schemas/billing.schema"
import { useCreatePackage, useUpdatePackage } from "@/features/billing/api/billing.queries"
import type { GymPackage } from "@/features/billing/types/billing.types"

type PackageEditorDialogProps = {
  gymPackage?: GymPackage
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

export function PackageEditorDialog({
  gymPackage,
  open,
  onOpenChange,
  trigger,
}: PackageEditorDialogProps) {
  const createMutation = useCreatePackage()
  const updateMutation = useUpdatePackage()

  const isEditMode = Boolean(gymPackage)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PackageFormInput, unknown, PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: "",
      durationDays: 30,
      price: 0,
      status: "active",
      supportsPT: false,
    },
  })

  // Reset form with appropriate values when opening dialog or when gymPackage changes
  useEffect(() => {
    if (open) {
      if (gymPackage) {
        reset({
          name: gymPackage.name,
          durationDays: gymPackage.durationDays,
          price: gymPackage.price,
          status: gymPackage.status,
          supportsPT: gymPackage.supportsPT,
        })
      } else {
        reset({
          name: "",
          durationDays: 30,
          price: 0,
          status: "active",
          supportsPT: false,
        })
      }
    }
  }, [open, gymPackage, reset])

  async function onSubmit(values: PackageFormValues) {
    try {
      if (isEditMode && gymPackage) {
        await updateMutation.mutateAsync({
          packageId: gymPackage.id,
          draft: values,
        })
        toast.success("Cập nhật gói tập thành công!")
      } else {
        await createMutation.mutateAsync(values)
        toast.success("Tạo gói tập mới thành công!")
      }
      onOpenChange(false)
    } catch (err) {
      // Hien dung message backend tra (vd "Ten goi nay da ton tai"), fallback cau chung.
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Có lỗi xảy ra. Vui lòng thử lại."
      toast.error(message)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md rounded-2xl p-0">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "Chỉnh sửa gói tập" : "Thêm gói tập mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin chi tiết cho gói tập hiện tại."
              : "Nhập các thông số để tạo một gói tập mới cho phòng gym."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="space-y-2">
            <label
              className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              htmlFor="name"
            >
              Tên gói tập
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Ví dụ: Premium 30"
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"
              data-testid="package-form-name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                htmlFor="durationDays"
              >
                Thời hạn (ngày)
              </label>
              <Input
                id="durationDays"
                type="number"
                placeholder="30"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"
                data-testid="package-form-duration"
                {...register("durationDays")}
              />
              {errors.durationDays && (
                <p className="text-xs font-semibold text-destructive">
                  {errors.durationDays.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                htmlFor="price"
              >
                Giá tiền (VND)
              </label>
              <Input
                id="price"
                type="number"
                placeholder="500000"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"
                data-testid="package-form-price"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-xs font-semibold text-destructive">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              htmlFor="status"
            >
              Trạng thái hoạt động
            </label>
            
            {/* Visually hidden native select for Playwright test compatibility & React Hook Form registration */}
            <select
              id="status"
              className="sr-only"
              data-testid="package-form-status"
              {...register("status")}
            >
              <option value="active">Hoạt động (Active)</option>
              <option value="inactive">Tạm dừng (Inactive)</option>
            </select>

            <Select
              value={watch("status")}
              onValueChange={(val: string) => setValue("status", val as "active" | "inactive", { shouldValidate: true })}
            >
              <SelectTrigger className="min-h-11 w-full bg-background border border-border rounded-xl px-3 text-sm text-foreground focus-visible:ring-primary/20 focus-visible:border-primary">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
                <SelectItem value="active" className="focus:bg-white/5 focus:text-white">Hoạt động (Active)</SelectItem>
                <SelectItem value="inactive" className="focus:bg-white/5 focus:text-white">Tạm dừng (Inactive)</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs font-semibold text-destructive">{errors.status.message}</p>
            )}
          </div>

          {/* Phan loai goi: co ho tro PT hay khong (SupportsPT) */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3">
            <div>
              <label htmlFor="supportsPT" className="text-sm font-semibold text-foreground">
                Gói có hỗ trợ PT
              </label>
              <p className="text-xs text-muted-foreground">
                Cho phép hội viên dùng huấn luyện viên cá nhân khi gói còn hiệu lực.
              </p>
            </div>
            <input
              id="supportsPT"
              type="checkbox"
              className="size-5 shrink-0 accent-primary"
              data-testid="package-form-supports-pt"
              {...register("supportsPT")}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
              disabled={isPending}
              data-testid="package-form-submit"
            >
              {isPending ? "Đang lưu..." : "Lưu gói tập"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
