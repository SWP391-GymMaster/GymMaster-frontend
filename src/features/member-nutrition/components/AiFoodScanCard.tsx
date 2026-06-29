"use client"

import { useRef, useState } from "react"
import { Camera, Check, LoaderCircle, Sparkles } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { StateBlock } from "@/components/feedback/StateBlock"
import { cn } from "@/lib/utils"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import {
  confirmAiFood,
  scanFoodImage,
  type FoodScanItem,
  type ScannedFoodDto,
} from "@/features/member-nutrition/api/member-nutrition.api"
import type { FoodItem } from "@/features/member-nutrition/types/member-nutrition.types"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// ScannedFoodDto (backend) -> FoodItem (FE) de dua vao form ghi nhat ky.
function toFoodItem(food: ScannedFoodDto): FoodItem {
  return {
    id: food.id,
    name: food.name,
    unit: food.unit,
    caloriesPerUnit: food.caloriesPerUnit,
    proteinG: food.proteinG,
    carbsG: food.carbsG,
    fatG: food.fatG,
  }
}

type AiFoodScanCardProps = {
  onSelectFood: (food: FoodItem) => void
}

/**
 * Quét ảnh món ăn bằng AI (Gemini). Tự chứa: nút quét + danh sách món AI nhận diện +
 * nút "Chọn" đưa món sang form ghi nhật ký. Món AI mới được lưu vào DB khi chọn.
 * Backend đã kiểm tra gói tập active (trả 403 nếu chưa có gói).
 */
export function AiFoodScanCard({ onSelectFood }: AiFoodScanCardProps) {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<FoodScanItem[] | null>(null)
  const [savingName, setSavingName] = useState<string | null>(null)
  const [savedFoods, setSavedFoods] = useState<Record<string, ScannedFoodDto>>({})

  const scan = useMutation({
    mutationFn: (file: File) => scanFoodImage(accessToken ?? "", file),
  })

  async function handleFile(file?: File) {
    if (!file) return
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      toast.error("Ảnh phải là JPG/PNG và dung lượng không quá 5MB.")
      return
    }

    setItems(null)
    setSavedFoods({})
    try {
      const result = await scan.mutateAsync(file)
      setItems(result.items ?? [])
    } catch {
      // lỗi hiển thị trong khối bên dưới (scan.isError)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function selectItem(item: FoodScanItem) {
    try {
      let food = item.food ?? savedFoods[item.recognizedName]
      if (!food && item.draft) {
        setSavingName(item.recognizedName)
        food = await confirmAiFood(accessToken ?? "", item.draft)
        setSavedFoods((prev) => ({ ...prev, [item.recognizedName]: food as ScannedFoodDto }))
      }
      if (!food) return
      onSelectFood(toFoodItem(food))
      toast.success(`Đã chọn: ${food.name}`)
    } catch {
      toast.error("Không thể chọn món này. Vui lòng thử lại.")
    } finally {
      setSavingName(null)
    }
  }

  return (
    <div className="gm-panel-muted p-4">
      <input
        ref={fileInputRef}
        accept="image/jpeg,image/png"
        capture="environment"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        type="file"
      />

      <Button
        type="button"
        className="min-h-12 w-full rounded-xl"
        disabled={scan.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {scan.isPending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Camera aria-hidden="true" className="size-4" />
        )}
        Quét ảnh món ăn bằng AI
      </Button>

      {(scan.isPending || scan.isError || items) && (
        <div className="mt-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-primary" />
            Món AI quét được
          </p>

          {scan.isPending ? (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin text-primary" />
              AI đang phân tích ảnh…
            </div>
          ) : scan.isError ? (
            <StateBlock
              description="Bạn có thể thử ảnh khác rõ hơn, hoặc nhập món thủ công."
              title="Không thể nhận diện ảnh"
              tone="error"
            />
          ) : items && items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((item) => {
                const saving = savingName === item.recognizedName
                const cal = item.food?.caloriesPerUnit ?? item.draft?.caloriesPerUnit ?? 0
                const p = item.food?.proteinG ?? item.draft?.proteinG ?? 0
                const c = item.food?.carbsG ?? item.draft?.carbsG ?? 0
                const f = item.food?.fatG ?? item.draft?.fatG ?? 0
                return (
                  <li
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                    key={item.recognizedName}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-foreground">
                          {item.recognizedName}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            item.resultSource === "Database"
                              ? "bg-primary/10 text-primary"
                              : "bg-amber-100 text-amber-800",
                          )}
                        >
                          {item.resultSource === "Database" ? "Có sẵn" : "AI ước lượng"}
                        </span>
                      </div>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {Math.round(cal)} kcal/100g · P {p}g · C {c}g · F {f}g
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0 rounded-lg"
                      disabled={saving}
                      onClick={() => void selectItem(item)}
                    >
                      {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
                      Chọn
                    </Button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="p-2 text-sm text-muted-foreground">
              Không nhận diện được món ăn nào. Hãy thử ảnh rõ hơn.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
