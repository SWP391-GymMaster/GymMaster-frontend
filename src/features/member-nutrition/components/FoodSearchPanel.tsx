"use client"

import { Search, Utensils } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { useFoodSearch } from "@/features/member-nutrition/api/member-nutrition.queries"
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
          <StateBlock
            description="Có thể thêm custom food sau khi luồng ghi bữa ổn định."
            title="Không tìm thấy món phù hợp."
            tone="empty"
          />
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
