"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDays, CheckCircle2, ClipboardList, ListPlus, Scale, Trash2, Utensils, Sunrise, Sun, Moon, Cookie } from "lucide-react"
import { useState, useEffect, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useCreateMemberMealLog,
  useCurrentMemberProfileId,
} from "@/features/member-nutrition/api/member-nutrition.queries"
import { FoodSearchPanel } from "@/features/member-nutrition/components/FoodSearchPanel"
import {
  mealLogSchema,
  mealTypes,
  type MealLogFormInput,
  type MealLogInput,
} from "@/features/member-nutrition/schemas/meal-log.schema"
import type {
  FoodItem,
  MealLogItemInput,
  MealType,
} from "@/features/member-nutrition/types/member-nutrition.types"
import {
  formatCalories,
  formatMealType,
} from "@/features/member-nutrition/utils/nutrition-formatters"

const LOCAL_STORAGE_KEY_RECENT_FOODS = "gymmaster-recent-foods"

function getRecentFoods(): FoodItem[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_RECENT_FOODS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecentFood(food: FoodItem) {
  if (typeof window === "undefined") return
  try {
    const current = getRecentFoods()
    const filtered = current.filter((f) => f.id !== food.id)
    const updated = [food, ...filtered].slice(0, 10) // store up to 10 recent items
    localStorage.setItem(LOCAL_STORAGE_KEY_RECENT_FOODS, JSON.stringify(updated))
  } catch (e) {
    console.warn(e)
  }
}

type MealLogFormProps = {
  date: string
  defaultMealType?: "breakfast" | "lunch" | "dinner" | "snack"
  onSuccess?: () => void
}

// 1 dong trong "gio" - mon da chon + khau phan + buoi an + ngay, cho toi khi xac nhan.
type CartLine = {
  uid: number
  food: FoodItem
  quantity: number
  mealType: MealType
  logDate: string
}

export function MealLogForm({ date, defaultMealType = "lunch", onSuccess }: MealLogFormProps) {
  const memberId = useCurrentMemberProfileId()
  const createMealLog = useCreateMemberMealLog()
  const [foodQuery, setFoodQuery] = useState("")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [mobileFormOpen, setMobileFormOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkWidth = () => {
        setIsDesktop(window.innerWidth >= 1024)
      }
      checkWidth()
      window.addEventListener("resize", checkWidth)
      return () => window.removeEventListener("resize", checkWidth)
    }
  }, [])

  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<MealLogFormInput, unknown, MealLogInput>({
    resolver: zodResolver(mealLogSchema),
    defaultValues: {
      foodItemId: 0,
      logDate: date,
      mealType: defaultMealType,
      quantity: 1,
    },
  })

  // Sync defaultMealType with form value when prop changes
  useEffect(() => {
    setValue("mealType", defaultMealType, { shouldValidate: true })
  }, [defaultMealType, setValue])

  const quantity = Number(watch("quantity") || 0)
  const estimatedCalories = selectedFood
    ? Math.round(selectedFood.caloriesPerUnit * quantity)
    : 0

  function selectFood(food: FoodItem) {
    setSelectedFood(food)
    setValue("foodItemId", food.id, { shouldValidate: true })
    // On mobile (no lg grid visible): open bottom sheet
    setMobileFormOpen(true)
  }

  // "Them vao danh sach": dua mon dang chon vao gio, KHONG goi API. Giu lai buoi an +
  // ngay de chon tiep mon khac. Chi khi bam "Xac nhan" moi ghi tat ca 1 lan.
  function addToCart(values: MealLogInput) {
    if (!selectedFood) return

    setCart((prev) => [
      ...prev,
      {
        uid: Date.now() + Math.random(),
        food: selectedFood,
        quantity: values.quantity,
        mealType: values.mealType,
        logDate: values.logDate,
      },
    ])
    saveRecentFood(selectedFood)
    toast.success(`Đã thêm vào danh sách: ${selectedFood.name}`)

    // Reset mon dang chon nhung giu buoi an + ngay de them mon tiep theo nhanh.
    reset({
      foodItemId: 0,
      logDate: values.logDate,
      mealType: values.mealType,
      quantity: 1,
    })
    setSelectedFood(null)
    setMobileFormOpen(false)
  }

  function removeFromCart(uid: number) {
    setCart((prev) => prev.filter((line) => line.uid !== uid))
  }

  // Ghi TAT CA mon trong gio. Gom theo (buoi an + ngay) vi backend nhan 1 mealType/lan.
  async function confirmCart() {
    if (!memberId) {
      toast.error("Chưa có hồ sơ hội viên.")
      return
    }
    if (cart.length === 0) return

    const groups = new Map<string, { mealType: MealType; logDate: string; items: MealLogItemInput[] }>()
    for (const line of cart) {
      const key = `${line.mealType}|${line.logDate}`
      const group = groups.get(key) ?? { mealType: line.mealType, logDate: line.logDate, items: [] }
      group.items.push({ foodItemId: line.food.id, quantity: line.quantity })
      groups.set(key, group)
    }

    try {
      for (const group of groups.values()) {
        await createMealLog.mutateAsync({
          memberId,
          logDate: group.logDate,
          mealType: group.mealType,
          items: group.items,
        })
      }
      toast.success(`Đã ghi ${cart.length} món vào nhật ký`)
      setCart([])
      setSelectedFood(null)
      reset({
        foodItemId: 0,
        logDate: getValues("logDate"),
        mealType: getValues("mealType"),
        quantity: 1,
      })
      onSuccess?.()
    } catch {
      toast.error("Không thể ghi nhật ký. Vui lòng thử lại.")
    }
  }

  const cartTotalCalories = cart.reduce(
    (sum, line) => sum + Math.round(line.food.caloriesPerUnit * line.quantity),
    0,
  )

  // Calculate macro distribution percentages (MyFitnessPal Donut Chart)
  const cG = selectedFood ? Math.round((selectedFood.carbsG || 0) * quantity) : 0
  const pG = selectedFood ? Math.round((selectedFood.proteinG || 0) * quantity) : 0
  const fG = selectedFood ? Math.round((selectedFood.fatG || 0) * quantity) : 0

  const cCal = cG * 4
  const pCal = pG * 4
  const fCal = fG * 9
  const totalCal = cCal + pCal + fCal

  const carbsPct = totalCal > 0 ? Math.round((cCal / totalCal) * 100) : 0
  const proteinPct = totalCal > 0 ? Math.round((pCal / totalCal) * 100) : 0
  const fatPct = totalCal > 0 ? 100 - carbsPct - proteinPct : 0

  const mealIconMap = {
    breakfast: Sunrise,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie,
  }

  function FormContent() {
    return (
      <>
        {selectedFood ? (
          <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3 mb-4">
              <div>
                <p className="text-base font-bold text-foreground">{selectedFood.name}</p>
                <p className="text-xs text-muted-foreground">
                  Phân lượng gốc: {selectedFood.caloriesPerUnit} kcal / {selectedFood.unit}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Đã chọn
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className="relative flex size-28 items-center justify-center rounded-full shadow-inner"
                style={{
                  background: totalCal > 0
                    ? `conic-gradient(rgb(34, 197, 94) 0% ${carbsPct}%, rgb(14, 165, 233) ${carbsPct}% ${carbsPct + proteinPct}%, rgb(245, 158, 11) ${carbsPct + proteinPct}% 100%)`
                    : "rgb(228, 228, 231)"
                }}
              >
                <div className="absolute size-20 rounded-full bg-card flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Calo</span>
                  <span className="text-lg font-black text-foreground">{estimatedCalories}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2 w-full text-center">
                <div className="rounded-xl bg-background border border-border/80 p-2">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-green-500">Carbs</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{cG}g</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">{carbsPct}% calo</p>
                </div>
                <div className="rounded-xl bg-background border border-border/80 p-2">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-sky-500">Protein</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{pG}g</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">{proteinPct}% calo</p>
                </div>
                <div className="rounded-xl bg-background border border-border/80 p-2">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-500">Fat</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{fG}g</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">{fatPct}% calo</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <StateBlock
            className="mt-5"
            description="Chọn một món ăn từ danh sách bên trái để bắt đầu."
            title="Chưa chọn món ăn."
            tone="empty"
          />
        )}

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit(addToCart)}>
          <input type="hidden" {...register("foodItemId")} />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Utensils className="size-4 text-primary" />
              Loại bữa ăn
            </label>
            <input type="hidden" {...register("mealType")} />
            <div className="grid grid-cols-4 gap-2">
              {mealTypes.map((t) => {
                const isActive = watch("mealType") === t
                const Icon = mealIconMap[t as keyof typeof mealIconMap] || Utensils
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("mealType", t, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-11 p-2 rounded-xl border text-xs font-semibold transition active:scale-95",
                      isActive
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-3.5 shrink-0 text-primary" />
                    <span>{formatMealType(t)}</span>
                  </button>
                )
              })}
            </div>
            {errors.mealType && (
              <p className="mt-1 text-xs font-medium text-destructive">{errors.mealType.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ngày ghi nhận" icon={CalendarDays}>
              <Input
                className="min-h-11 w-full bg-background px-4 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                data-testid="member-meal-date-input"
                id="meal-date"
                type="date"
                {...register("logDate")}
              />
              {errors.logDate && (
                <p className="mt-2 text-sm font-medium text-destructive">{errors.logDate.message}</p>
              )}
            </Field>

            <div className="space-y-2">
              <Field label="Số phần ăn (khẩu phần)" icon={Scale}>
                <Input
                  className="min-h-11 w-full bg-background px-4 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                  data-testid="member-meal-quantity-input"
                  id="meal-quantity"
                  min="0"
                  step="0.1"
                  type="number"
                  {...register("quantity")}
                />
              </Field>
              <div className="flex gap-2 flex-wrap">
                {[0.5, 1, 1.5, 2, 3].map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => setValue("quantity", mult, { shouldValidate: true })}
                    className={cn(
                      "min-h-11 px-3 py-2 text-xs rounded-xl border transition active:scale-95 flex items-center justify-center font-bold min-w-[48px]",
                      quantity === mult
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
              {errors.quantity && (
                <p className="mt-1 text-xs font-medium text-destructive">{errors.quantity.message}</p>
              )}
              {errors.foodItemId && (
                <p className="mt-1 text-xs font-medium text-destructive">{errors.foodItemId.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 mt-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Ước tính lượng Calo</span>
              <span className="text-lg font-bold text-foreground">{formatCalories(estimatedCalories)}</span>
            </div>
          </div>

          <Button
            className="min-h-[52px] rounded-xl bg-foreground text-background hover:bg-foreground/90 w-full mt-2"
            data-testid="member-add-meal-button"
            disabled={createMealLog.isPending}
            type="submit"
          >
            <ListPlus aria-hidden="true" className="size-4" />
            Thêm vào danh sách
          </Button>
        </form>

        {createMealLog.isError && (
          <StateBlock
            className="mt-4"
            description="Kiểm tra món ăn và khẩu phần đã chọn, sau đó thử lại."
            title="Không thể thêm bữa ăn."
            tone="error"
          />
        )}
      </>
    )
  }

  function CartSection() {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="size-4.5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Danh sách món sẽ ghi
            </h3>
            <p className="text-xs text-muted-foreground">
              {cart.length} món · {formatCalories(cartTotalCalories)}
            </p>
          </div>
        </div>

        {cart.length === 0 ? (
          <StateBlock
            className="mt-4"
            description="Chọn món bên trái, chỉnh khẩu phần rồi bấm “Thêm vào danh sách”. Thêm nhiều món rồi xác nhận một lần."
            title="Chưa có món nào trong danh sách."
            tone="empty"
          />
        ) : (
          <>
            <ul className="mt-4 space-y-2">
              {cart.map((line) => (
                <li
                  key={line.uid}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground">
                        {line.food.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        {formatMealType(line.mealType)}
                      </span>
                    </div>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {line.quantity}x ·{" "}
                      {formatCalories(
                        Math.round(line.food.caloriesPerUnit * line.quantity),
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.uid)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive active:scale-95"
                    title="Xóa khỏi danh sách"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <span className="text-sm text-muted-foreground">Tổng calo</span>
              <span className="text-lg font-bold text-foreground">
                {formatCalories(cartTotalCalories)}
              </span>
            </div>

            <Button
              className="mt-3 min-h-[52px] w-full rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
              data-testid="member-confirm-cart-button"
              disabled={createMealLog.isPending}
              onClick={confirmCart}
              type="button"
            >
              <CheckCircle2 aria-hidden="true" className="size-4" />
              {createMealLog.isPending
                ? "Đang ghi nhật ký..."
                : `Xác nhận ghi ${cart.length} món vào nhật ký`}
            </Button>
          </>
        )}
      </section>
    )
  }

  return (
    <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" id="add-meal">
      <FoodSearchPanel
        onQueryChange={setFoodQuery}
        onSelectFood={selectFood}
        query={foodQuery}
        selectedFoodId={selectedFood?.id}
      />

      {/* DESKTOP: always-visible right panel (hidden on mobile) */}
      {isDesktop && (
        <section className="hidden lg:flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Utensils aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Ghi nhận dinh dưỡng
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Điều chỉnh số lượng và chọn buổi ăn để ghi vào nhật ký hàng ngày.
              </p>
            </div>
          </div>
          <FormContent />
        </section>
      )}

      {/* MOBILE: bottom sheet — only opens when food is selected */}
      {!isDesktop && (
        <Sheet
          open={mobileFormOpen}
          onOpenChange={(open) => {
            setMobileFormOpen(open)
            // Clear selection when sheet is dismissed to reset state cleanly
            if (!open) {
              setSelectedFood(null)
              setValue("foodItemId", 0)
            }
          }}
        >
          <SheetContent
            side="bottom"
            className="lg:hidden rounded-t-[2rem] border-border bg-card p-0 max-h-[90dvh] flex flex-col"
            data-testid="mobile-meal-log-sheet"
          >
            {/* Drag handle */}
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted" />

            <SheetHeader className="shrink-0 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Utensils className="size-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    Thêm vào nhật ký
                  </p>
                  <SheetTitle className="mt-0.5 text-lg font-black tracking-tight text-foreground">
                    Ghi nhận dinh dưỡng
                  </SheetTitle>
                </div>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FormContent />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>

      <CartSection />
    </div>
  )
}

function Field({
  children,
  icon: Icon,
  label,
}: {
  children: ReactNode
  icon: typeof Utensils
  label: string
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon aria-hidden="true" className="size-4 text-primary" />
        {label}
      </span>
      {children}
    </label>
  )
}
