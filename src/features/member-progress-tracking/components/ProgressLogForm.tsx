"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  progressEntrySchema,
  type ProgressEntryFormInput,
  type ProgressEntryFormValues,
} from "@/features/member-progress-tracking/schemas/member-progress.schema"
import { useCreateProgressEntry } from "@/features/member-progress-tracking/api/member-progress.queries"

type ProgressLogFormProps = {
  memberId: number
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function ProgressLogForm({ memberId, onSuccess, trigger }: ProgressLogFormProps) {
  const [open, setOpen] = useState(false)
  const createEntry = useCreateProgressEntry(memberId)

  const todayStr = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProgressEntryFormInput, unknown, ProgressEntryFormValues>({
    resolver: zodResolver(progressEntrySchema),
    defaultValues: {
      measuredAt: todayStr,
      weightKg: "" as unknown as number,
      bodyFatPct: undefined,
    },
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      reset({
        measuredAt: todayStr,
        weightKg: "" as unknown as number,
        bodyFatPct: undefined,
      })
    }
  }, [open, reset, todayStr])

  async function onSubmit(values: ProgressEntryFormValues) {
    try {
      await createEntry.mutateAsync({
        measuredAt: values.measuredAt,
        weightKg: values.weightKg,
        bodyFatPct: values.bodyFatPct,
      })
      toast.success("Ghi nhận chỉ số tiến độ thành công!")
      if (onSuccess) onSuccess()
      setOpen(false)
    } catch {
      toast.error("Không thể ghi nhận chỉ số. Vui lòng thử lại.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
            data-testid="member-progress-trigger"
          >
            <Plus className="size-4 mr-2" />
            Ghi nhận chỉ số mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl p-0">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle className="text-xl font-bold">Ghi nhận chỉ số cơ thể</DialogTitle>
          <DialogDescription>
            Cập nhật cân nặng và tỷ lệ mỡ cơ thể hiện tại của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground" htmlFor="measuredAt">
              Ngày ghi nhận
            </label>
            <input
              id="measuredAt"
              type="date"
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
              data-testid="progress-form-date"
              {...register("measuredAt")}
            />
            {errors.measuredAt && (
              <p className="text-xs font-semibold text-destructive">{errors.measuredAt.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground" htmlFor="weightKg">
                Cân nặng (kg)
              </label>
              <input
                id="weightKg"
                type="number"
                step="0.1"
                placeholder="Ví dụ: 72.5"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                data-testid="progress-form-weight"
                {...register("weightKg")}
              />
              {errors.weightKg && (
                <p className="text-xs font-semibold text-destructive">{errors.weightKg.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground" htmlFor="bodyFatPct">
                Tỷ lệ mỡ (%) <span className="text-muted-foreground font-normal">(Không bắt buộc)</span>
              </label>
              <input
                id="bodyFatPct"
                type="number"
                step="0.1"
                placeholder="Ví dụ: 18.5"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                data-testid="progress-form-fat"
                {...register("bodyFatPct")}
              />
              {errors.bodyFatPct && (
                <p className="text-xs font-semibold text-destructive">{errors.bodyFatPct.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
              disabled={createEntry.isPending}
              data-testid="progress-form-submit"
            >
              {createEntry.isPending ? "Đang lưu..." : "Lưu chỉ số"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
