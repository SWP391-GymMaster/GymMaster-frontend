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
import { ApiClientError } from "@/lib/api/http-client"
import { vnTodayIso } from "@/lib/date/vn-time"

type ProgressLogFormProps = {
  memberId: number
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function ProgressLogForm({ memberId, onSuccess, trigger }: ProgressLogFormProps) {
  const [open, setOpen] = useState(false)
  const createEntry = useCreateProgressEntry(memberId)

  const todayStr = vnTodayIso()

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
    } catch (error) {
      const message =
        error instanceof ApiClientError && error.message
          ? error.message
          : "Không thể ghi nhận chỉ số. Vui lòng thử lại."
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="min-h-11 rounded-full bg-primary px-5 text-primary-foreground hover:brightness-95 active:scale-[0.98]"
            data-testid="member-progress-trigger"
          >
            <Plus className="size-4 mr-2" />
            Ghi nhận chỉ số mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="gm-dialog-surface max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] gap-0 p-0 sm:max-w-[40rem]">
        <DialogHeader className="gm-dialog-header">
          <DialogTitle>Ghi nhận chỉ số cơ thể</DialogTitle>
          <DialogDescription>
            Cập nhật cân nặng và tỷ lệ mỡ cơ thể hiện tại của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="gm-dialog-body space-y-5">
            <div className="space-y-2">
            <label className="gm-dialog-label" htmlFor="measuredAt">
              Ngày ghi nhận
            </label>
            <input
              id="measuredAt"
              type="date"
              max={todayStr}
              className="gm-field min-h-12 w-full px-4 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-muted-foreground"
              data-testid="progress-form-date"
              {...register("measuredAt")}
            />
            {errors.measuredAt && (
              <p className="text-xs font-semibold text-destructive">{errors.measuredAt.message}</p>
            )}
          </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <label className="gm-dialog-label min-h-8" htmlFor="weightKg">
                Cân nặng (kg)
              </label>
              <input
                id="weightKg"
                type="number"
                step="0.1"
                placeholder="Ví dụ: 72.5"
                className="gm-field min-h-12 w-full px-4 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-muted-foreground"
                data-testid="progress-form-weight"
                {...register("weightKg")}
              />
              {errors.weightKg && (
                <p className="text-xs font-semibold text-destructive">{errors.weightKg.message}</p>
              )}
            </div>

              <div className="min-w-0 space-y-2">
              <label className="gm-dialog-label min-h-8" htmlFor="bodyFatPct">
                Tỷ lệ mỡ (%) <span className="text-muted-foreground font-normal">(Không bắt buộc)</span>
              </label>
              <input
                id="bodyFatPct"
                type="number"
                step="0.1"
                placeholder="Ví dụ: 18.5"
                className="gm-field min-h-12 w-full px-4 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-muted-foreground"
                data-testid="progress-form-fat"
                {...register("bodyFatPct")}
              />
              {errors.bodyFatPct && (
                <p className="text-xs font-semibold text-destructive">{errors.bodyFatPct.message}</p>
              )}
            </div>
            </div>
          </div>

          <div className="gm-dialog-footer">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-full px-5"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="min-h-11 rounded-full bg-primary px-5 text-primary-foreground hover:brightness-95 active:scale-[0.98]"
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
