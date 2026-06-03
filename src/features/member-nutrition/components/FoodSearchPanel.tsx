"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Utensils } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { StateBlock } from "@/components/feedback/StateBlock"
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
  useFoodSearch,
  useCreateCustomFoodItem,
} from "@/features/member-nutrition/api/member-nutrition.queries"
import {
  customFoodSchema,
  type CustomFoodFormInput,
  type CustomFoodFormValues,
} from "@/features/member-nutrition/schemas/custom-food.schemas"
import type { FoodItem } from "@/features/member-nutrition/types/member-nutrition.types"
import { formatCalories } from "@/features/member-nutrition/utils/nutrition-formatters"

const quickSearches = ["ức gà", "cơm", "chuối", "trứng", "sữa", "yến mạch"]

type FoodSearchPanelProps = {
  query: string
  selectedFoodId?: number
  onQueryChange: (query: string) => void
  onSelectFood: (food: FoodItem) => void
}

export function FoodSearchPanel({
  query,
  selectedFoodId,
  onQueryChange,
  onSelectFood,
}: FoodSearchPanelProps) {
  const foods = useFoodSearch(query)
  const canSearch = query.trim().length >= 2

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Search aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Tìm món ăn
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Tìm trong cơ sở dữ liệu món ăn trước khi ghi bữa.
          </p>
        </div>
      </div>

      <label className="mt-5 block text-sm font-medium text-foreground" htmlFor="food-search">
        Tên món
      </label>
      <div className="relative mt-2">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          className="min-h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
          data-testid="member-food-search-input"
          id="food-search"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ức gà, cơm, chuối..."
          value={query}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickSearches.map((quickSearch) => (
          <Button
            className="h-9 rounded-full border-border bg-card px-3 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98]"
            key={quickSearch}
            onClick={() => onQueryChange(quickSearch)}
            type="button"
            variant="outline"
          >
            {quickSearch}
          </Button>
        ))}
      </div>

      <div className="mt-5 grid gap-2">
        {!canSearch ? (
          <StateBlock
            description="Nhập ít nhất hai ký tự để tìm món ăn."
            title="Bắt đầu bằng tên món."
            tone="empty"
          />
        ) : null}
        {foods.isLoading ? (
          <StateBlock
            description="Đang tìm món ăn phù hợp."
            title="Đang tìm món..."
            tone="loading"
          />
        ) : null}
        {foods.isError ? (
          <StateBlock
            description="Tìm kiếm món ăn đang tạm thời gián đoạn."
            title="Không thể tìm món ăn."
            tone="error"
          />
        ) : null}
        {canSearch && foods.data?.items.length === 0 ? (
          <div className="space-y-4">
            <StateBlock
              description="Bạn có thể tự tạo món ăn mới này để ghi nhận bữa ăn của mình."
              title="Không tìm thấy món phù hợp."
              tone="empty"
            />
            <CreateCustomFoodDialog initialName={query} onCreated={onSelectFood} />
          </div>
        ) : null}
        {foods.data?.items.map((food) => (
          <Button
            className="h-auto justify-between gap-4 rounded-xl border-border bg-background p-4 text-left text-foreground hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98] data-[selected=true]:border-primary data-[selected=true]:bg-primary/10"
            data-selected={selectedFoodId === food.id}
            data-testid="member-food-result"
            key={food.id}
            onClick={() => onSelectFood(food)}
            type="button"
            variant="outline"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Utensils aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{food.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {formatCalories(food.caloriesPerUnit)} mỗi {food.unit}
                </span>
              </span>
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Chọn
            </span>
          </Button>
        ))}
      </div>
    </section>
  )
}

type CreateCustomFoodDialogProps = {
  initialName: string
  onCreated: (food: FoodItem) => void
}

export function CreateCustomFoodDialog({ initialName, onCreated }: CreateCustomFoodDialogProps) {
  const [open, setOpen] = useState(false)
  const createFood = useCreateCustomFoodItem()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomFoodFormInput, unknown, CustomFoodFormValues>({
    resolver: zodResolver(customFoodSchema),
    defaultValues: {
      name: initialName,
      unit: "gam",
      caloriesPerUnit: 0,
      carbsG: 0,
      proteinG: 0,
      fatG: 0,
    },
  })

  useEffect(() => {
    reset({
      name: initialName,
      unit: "gam",
      caloriesPerUnit: 0,
      carbsG: 0,
      proteinG: 0,
      fatG: 0,
    })
  }, [initialName, reset])

  async function onSubmit(values: CustomFoodFormValues) {
    try {
      const food = await createFood.mutateAsync(values)
      toast.success(`Đã tạo món ăn: ${food.name}`)
      onCreated(food)
      setOpen(false)
    } catch {
      toast.error("Không thể tạo món ăn. Vui lòng thử lại.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="min-h-11 w-full rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
          data-testid="member-custom-food-trigger"
        >
          <Plus className="size-4 mr-2" />
          Tự tạo món ăn mới
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl p-0">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle className="text-xl font-bold">Tạo món ăn mới</DialogTitle>
          <DialogDescription>
            Tạo món ăn tùy chỉnh để thêm vào nhật ký bữa ăn của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground" htmlFor="custom-food-name">
              Tên món ăn
            </label>
            <input
              id="custom-food-name"
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
              data-testid="member-custom-food-name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground" htmlFor="custom-food-unit">
                Đơn vị tính
              </label>
              <input
                id="custom-food-unit"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                data-testid="member-custom-food-unit"
                placeholder="Ví dụ: gam, cái, chén"
                {...register("unit")}
              />
              {errors.unit && (
                <p className="text-xs font-semibold text-destructive">{errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground" htmlFor="custom-food-calories">
                Calo mỗi đơn vị
              </label>
              <input
                id="custom-food-calories"
                type="number"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                data-testid="member-custom-food-calories"
                {...register("caloriesPerUnit")}
              />
              {errors.caloriesPerUnit && (
                <p className="text-xs font-semibold text-destructive">{errors.caloriesPerUnit.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground text-xs" htmlFor="custom-food-carbs">
                Carbs (g)
              </label>
              <input
                id="custom-food-carbs"
                type="number"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                {...register("carbsG")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground text-xs" htmlFor="custom-food-protein">
                Protein (g)
              </label>
              <input
                id="custom-food-protein"
                type="number"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                {...register("proteinG")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground text-xs" htmlFor="custom-food-fat">
                Fat (g)
              </label>
              <input
                id="custom-food-fat"
                type="number"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                {...register("fatG")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
              >
                Hủy
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              disabled={isSubmitting || createFood.isPending}
              className="rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
              data-testid="member-custom-food-submit"
            >
              {createFood.isPending ? "Đang tạo..." : "Tạo món"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
