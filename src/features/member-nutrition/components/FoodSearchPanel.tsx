"use client"

import { Search } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { useFoodSearch } from "@/features/member-nutrition/api/member-nutrition.queries"
import type { FoodItem } from "@/features/member-nutrition/types/member-nutrition.types"
import { formatCalories } from "@/features/member-nutrition/utils/nutrition-formatters"

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
    <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-800">
          <Search aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Food search</h2>
          <p className="text-sm text-zinc-600">
            Search the food database before logging a meal.
          </p>
        </div>
      </div>

      <label className="mt-4 block text-sm font-medium text-zinc-800" htmlFor="food-search">
        Food name
      </label>
      <input
        className="mt-2 min-h-11 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition-colors focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        data-testid="member-food-search-input"
        id="food-search"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Chicken, rice, banana..."
        value={query}
      />

      <div className="mt-4 grid gap-2">
        {!canSearch ? (
          <StateBlock
            description="Enter at least two characters to search foods."
            title="Start with a food name."
            tone="empty"
          />
        ) : null}
        {foods.isLoading ? (
          <StateBlock
            description="Finding matching food items."
            title="Searching foods..."
            tone="loading"
          />
        ) : null}
        {foods.isError ? (
          <StateBlock
            description="Food search is temporarily unavailable."
            title="Could not search foods."
            tone="error"
          />
        ) : null}
        {canSearch && foods.data?.items.length === 0 ? (
          <StateBlock
            description="Custom food is planned after the core meal log flow is stable."
            title="No matching food found."
            tone="empty"
          />
        ) : null}
        {foods.data?.items.map((food) => (
          <Button
            className="h-auto justify-start rounded-[1.25rem] border-zinc-200 bg-white p-4 text-left text-zinc-950 hover:border-emerald-300 hover:bg-emerald-50 data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50"
            data-selected={selectedFoodId === food.id}
            data-testid="member-food-result"
            key={food.id}
            onClick={() => onSelectFood(food)}
            type="button"
            variant="outline"
          >
            <span>
              <span className="block font-semibold">{food.name}</span>
              <span className="mt-1 block text-sm text-zinc-600">
                {formatCalories(food.caloriesPerUnit)} per {food.unit}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </section>
  )
}
