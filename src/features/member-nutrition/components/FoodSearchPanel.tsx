"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Utensils, History, Heart, Info, AlertTriangle, Globe } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  useFoodOnlineSearch,
} from "@/features/member-nutrition/api/member-nutrition.queries"
import { searchFoodItems } from "@/features/member-nutrition/api/member-nutrition.api"
import { AiFoodScanCard } from "@/features/member-nutrition/components/AiFoodScanCard"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import {
  customFoodSchema,
  type CustomFoodFormInput,
  type CustomFoodFormValues,
} from "@/features/member-nutrition/schemas/custom-food.schemas"
import type {
  FoodItem,
  CreateCustomFoodInput,
} from "@/features/member-nutrition/types/member-nutrition.types"
import { formatCalories } from "@/features/member-nutrition/utils/nutrition-formatters"

const quickSearches = ["ức gà", "cơm", "chuối", "trứng", "sữa", "yến mạch"]

const LOCAL_STORAGE_KEY_RECENT_FOODS = "gymmaster-recent-foods"
const LOCAL_STORAGE_KEY_CUSTOM_FOODS = "gymmaster-custom-foods"

function getRecentFoods(): FoodItem[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_RECENT_FOODS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function getCustomFoods(): FoodItem[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_FOODS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

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
  const [activeTab, setActiveTab] = useState<"search" | "recent" | "custom">("search")
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([])
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([])

  // Preview & confirm states (dung cho ket qua tra cuu online)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)

  // Online search states
  const [onlineSearchTriggered, setOnlineSearchTriggered] = useState(false)
  const [cooldownSecs, setCooldownSecs] = useState(0)

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownSecs <= 0) return
    const timer = setInterval(() => {
      setCooldownSecs((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSecs])

  const triggerOnlineSearch = () => {
    if (cooldownSecs > 0) return
    setOnlineSearchTriggered(true)
    setCooldownSecs(60)
  }

  
  // Edited values inside preview
  const [previewName, setPreviewName] = useState("")
  const [previewUnit, setPreviewUnit] = useState("")
  const [previewCalories, setPreviewCalories] = useState(0)
  const [previewProtein, setPreviewProtein] = useState(0)
  const [previewCarbs, setPreviewCarbs] = useState(0)
  const [previewFat, setPreviewFat] = useState(0)

  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const foods = useFoodSearch(query)
  const canSearch = query.trim().length >= 2

  const onlineSearch = useFoodOnlineSearch(query, onlineSearchTriggered)
  const createFood = useCreateCustomFoodItem()

  /* eslint-disable react-hooks/set-state-in-effect */
  // Reset online search when keyword changes
  useEffect(() => {
    setOnlineSearchTriggered(false)
  }, [query])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Handle online search product selection
  const handleSelectOnlineFood = (food: CreateCustomFoodInput) => {
    setPreviewName(food.name)
    setPreviewUnit(food.unit)
    setPreviewCalories(food.caloriesPerUnit)
    setPreviewProtein(food.proteinG || 0)
    setPreviewCarbs(food.carbsG || 0)
    setPreviewFat(food.fatG || 0)
    setIsPreviewOpen(true)
  }

  // Save or Select the previewed product
  const handleConfirmProduct = async () => {
    if (!previewName.trim() || !previewUnit.trim()) {
      toast.error("Vui lòng điền đầy đủ tên và đơn vị.")
      return
    }

    setIsSavingProduct(true)
    try {
      // 1. Search if the food item with the exact name already exists in database (UQ_FoodItems_Name check)
      const searchResults = await searchFoodItems(accessToken ?? "", previewName)
      const exactMatch = searchResults.items.find(
        (item) => item.name.toLowerCase() === previewName.toLowerCase()
      )

      if (exactMatch) {
        toast.success(`Tìm thấy món ăn có sẵn: ${exactMatch.name}`)
        onSelectFood(exactMatch)
        setIsPreviewOpen(false)
        return
      }

      // 2. Not found, create it as a new Custom Food Item
      const newFood = await createFood.mutateAsync({
        name: previewName,
        unit: previewUnit,
        caloriesPerUnit: previewCalories,
        proteinG: previewProtein,
        carbsG: previewCarbs,
        fatG: previewFat,
      })

      toast.success(`Đã lưu thực phẩm mới: ${newFood.name}`)
      
      // Sync with Local Custom List
      const existing = getCustomFoods()
      const updated = [newFood, ...existing]
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_FOODS, JSON.stringify(updated))
      setCustomFoods(updated)

      onSelectFood(newFood)
      setIsPreviewOpen(false)
    } catch (err) {
      console.error("Save product from barcode failed:", err)
      toast.error("Không thể lưu sản phẩm. Vui lòng thử lại.")
    } finally {
      setIsSavingProduct(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecentFoods(getRecentFoods())
      setCustomFoods(getCustomFoods())
    }, 0)
    return () => clearTimeout(timer)
  }, [activeTab, selectedFoodId])

  const handleCustomFoodCreated = (food: FoodItem) => {
    // Save to local custom list
    const existing = getCustomFoods()
    const updated = [food, ...existing]
    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_FOODS, JSON.stringify(updated))
    setCustomFoods(updated)

    // Select the newly created food
    onSelectFood(food)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Utensils aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Cơ sở dữ liệu món ăn
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Tra cứu thực phẩm thô và món ăn chế biến sẵn chuẩn MyFitnessPal.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={cn(
            "flex-1 py-3 min-h-11 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2",
            activeTab === "search"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Search className="size-4" />
          Tra cứu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("recent")}
          className={cn(
            "flex-1 py-3 min-h-11 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2",
            activeTab === "recent"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="size-4" />
          Gần đây
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={cn(
            "flex-1 py-3 min-h-11 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2",
            activeTab === "custom"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className="size-4" />
          Tự tạo
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-5">
        {activeTab === "search" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground" htmlFor="food-search">
                Tên thực phẩm hoặc món ăn
              </label>
              <div className="mt-2">
                <div className="relative flex-1">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="min-h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"
                    data-testid="member-food-search-input"
                    id="food-search"
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Gõ 'ức gà', 'cơm trắng', 'phở bò'..."
                    value={query}
                  />
                </div>
              </div>
            </div>

            <AiFoodScanCard onSelectFood={onSelectFood} />

            <div className="flex flex-wrap gap-2">
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
            {canSearch && foods.data && foods.data.items.length > 0 && (
              <p className="text-xs font-semibold text-muted-foreground px-1">
                Tìm thấy {foods.data.total.toLocaleString("vi-VN")} kết quả tương thích (trong tổng số 32,800 thực phẩm & món ăn).
              </p>
            )}

            <div className="grid gap-2">
              {!canSearch && (
                <StateBlock
                  description="Nhập từ khóa thực phẩm thô (ví dụ: 'ức gà', 'cá hồi') hoặc món ăn (ví dụ: 'phở bò', 'cơm tấm') để tìm kiếm."
                  title="Tìm món ăn chuẩn"
                  tone="empty"
                />
              )}
              {canSearch && foods.isLoading && (
                <StateBlock
                  description="Đang tìm kiếm hàng ngàn thực phẩm dinh dưỡng..."
                  title="Đang tra cứu..."
                  tone="loading"
                />
              )}
              {canSearch && foods.isError && (
                <StateBlock
                  description="Tìm kiếm món ăn đang tạm thời gián đoạn."
                  title="Không thể tìm món ăn."
                  tone="error"
                />
              )}

              {/* Local results rendering */}
              {canSearch && foods.data?.items.map((food) => (
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
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatCalories(food.caloriesPerUnit)} mỗi {food.unit}
                        {food.proteinG !== undefined && ` · P: ${food.proteinG}g C: ${food.carbsG}g F: ${food.fatG}g`}
                      </span>
                    </span>
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Chọn
                  </span>
                </Button>
              ))}

              {/* If local has results but online search is not triggered yet */}
              {canSearch && foods.data && foods.data.items.length > 0 && !onlineSearchTriggered && (
                <div className="mt-2 text-center">
                  <div className="inline-flex items-center gap-1 group relative">
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs font-semibold text-primary hover:underline h-auto p-0"
                      onClick={triggerOnlineSearch}
                      disabled={cooldownSecs > 0}
                      data-testid="online-search-link"
                    >
                      {cooldownSecs > 0
                        ? `Chờ ${cooldownSecs}s để tìm trực tuyến cho "${query}"`
                        : `Không tìm thấy món bạn cần? Thử tìm kiếm trực tuyến cho "${query}"`}
                    </Button>
                    {cooldownSecs === 0 && (
                      <div className="relative flex items-center">
                        <Info className="size-3.5 text-primary/60 cursor-help" />
                        <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded bg-zinc-950 p-2 text-[10px] text-zinc-100 shadow-md z-10 text-center pointer-events-none">
                          Tìm kiếm từ cơ sở dữ liệu Open Food Facts mở rộng. Giới hạn 10 requests/phút.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* If local is empty and online search is not triggered yet */}
              {canSearch && foods.data?.items.length === 0 && !onlineSearchTriggered && (
                <div className="space-y-4">
                  <StateBlock
                    description="Không tìm thấy món phù hợp trong cơ sở dữ liệu. Bạn có thể tra cứu trực tuyến hoặc tự tạo món mới."
                    title="Không tìm thấy món phù hợp"
                    tone="empty"
                  />
                  <div className="flex flex-col gap-2">
                    <div className="relative group w-full">
                      <Button
                        type="button"
                        onClick={triggerOnlineSearch}
                        disabled={cooldownSecs > 0}
                        className="min-h-11 w-full rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98] flex items-center justify-center gap-2"
                        data-testid="online-search-trigger-btn"
                      >
                        <Search className="size-4" />
                        {cooldownSecs > 0
                          ? `Chờ ${cooldownSecs}s để tìm trực tuyến...`
                          : `Tìm kiếm trực tuyến cho "${query}"`}
                        {cooldownSecs === 0 && <Info className="size-3.5 opacity-80" />}
                      </Button>
                      {cooldownSecs === 0 && (
                        <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded bg-zinc-950 p-2 text-xs text-zinc-100 shadow-md z-10 text-center pointer-events-none">
                          Tra cứu dữ liệu Open Food Facts mở rộng. Yêu cầu kích hoạt thủ công do giới hạn 10 lần/phút của API.
                        </span>
                      )}
                    </div>
                    <CreateCustomFoodDialog initialName={query} onCreated={handleCustomFoodCreated} />
                  </div>
                </div>
              )}

              {/* Online Search State Blocks */}
              {onlineSearchTriggered && onlineSearch.isFetching && (
                <div className="mt-4">
                  <StateBlock
                    description="Đang kết nối và tải kết quả từ cơ sở dữ liệu Open Food Facts..."
                    title="Đang tìm kiếm trực tuyến..."
                    tone="loading"
                  />
                </div>
              )}
              {onlineSearchTriggered && !onlineSearch.isFetching && onlineSearch.isError && (
                <div className="mt-4">
                  {onlineSearch.error?.message?.includes("429") || onlineSearch.error?.message?.includes("Too Many") ? (
                    <div className="space-y-4">
                      <StateBlock
                        description="Đã đạt giới hạn tra cứu. Hệ thống Open Food Facts giới hạn 10 lần tìm kiếm/phút. Vui lòng đợi 1–2 phút rồi thử lại, hoặc tự tạo món ăn tùy chỉnh."
                        title="Đạt giới hạn tần suất (Rate Limit)"
                        tone="error"
                      />
                      <CreateCustomFoodDialog initialName={query} onCreated={handleCustomFoodCreated} />
                    </div>
                  ) : (
                    <StateBlock
                      description="Tìm kiếm trực tuyến tạm thời thất bại do sự cố kết nối mạng."
                      title="Tìm kiếm trực tuyến thất bại"
                      tone="error"
                    />
                  )}
                </div>
              )}
              {onlineSearchTriggered && !onlineSearch.isFetching && !onlineSearch.isError && onlineSearch.data?.length === 0 && (
                <div className="mt-4 space-y-4">
                  <StateBlock
                    description={`Không tìm thấy kết quả nào trên hệ thống Open Food Facts với từ khóa "${query}".`}
                    title="Không tìm thấy kết quả trực tuyến"
                    tone="empty"
                  />
                  {foods.data?.items.length === 0 && (
                    <CreateCustomFoodDialog initialName={query} onCreated={handleCustomFoodCreated} />
                  )}
                </div>
              )}

              {/* Online Search Results Display */}
              {onlineSearchTriggered && !onlineSearch.isFetching && !onlineSearch.isError && onlineSearch.data && onlineSearch.data.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200/60 bg-amber-50/60 px-3 py-2.5 text-xs text-amber-700">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      Kết quả từ <strong>Open Food Facts</strong> — dữ liệu cộng đồng quốc tế. Giới hạn 10 lần tra cứu/phút. Sản phẩm Việt Nam có thể thiếu.
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                    Kết quả trực tuyến từ Open Food Facts
                  </h3>
                  <div className="grid gap-2">
                    {onlineSearch.data.map((food, idx) => (
                      <Button
                        className="h-auto justify-between gap-4 rounded-xl border-border bg-background p-4 text-left text-foreground hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98]"
                        key={`online-${idx}`}
                        data-testid="online-food-result"
                        onClick={() => handleSelectOnlineFood(food)}
                        type="button"
                        variant="outline"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">
                            <Utensils aria-hidden="true" className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 min-w-0">
                              <span className="block truncate font-semibold">{food.name}</span>
                              <span className="inline-flex items-center gap-0.5 shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
                                <Globe className="size-2.5" /> OFF
                              </span>
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {formatCalories(food.caloriesPerUnit)} mỗi {food.unit}
                              {food.proteinG !== undefined && ` · P: ${food.proteinG}g C: ${food.carbsG}g F: ${food.fatG}g`}
                            </span>
                          </span>
                        </span>
                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600">
                          Chọn
                        </span>
                      </Button>
                    ))}
                  </div>
                  {foods.data?.items.length === 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2 px-1">Vẫn không tìm thấy món phù hợp?</p>
                      <CreateCustomFoodDialog initialName={query} onCreated={handleCustomFoodCreated} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "recent" && (
          <div className="grid gap-2">
            {recentFoods.length === 0 ? (
              <StateBlock
                description="Bạn chưa ghi bữa ăn nào gần đây. Hãy tra cứu và thêm món ăn để tích lũy lịch sử ghi bữa."
                title="Chưa có món ăn gần đây"
                tone="empty"
              />
            ) : (
              recentFoods.map((food) => (
                <Button
                  className="h-auto justify-between gap-4 rounded-xl border-border bg-background p-4 text-left text-foreground hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98] data-[selected=true]:border-primary data-[selected=true]:bg-primary/10"
                  data-selected={selectedFoodId === food.id}
                  key={`recent-${food.id}`}
                  onClick={() => onSelectFood(food)}
                  type="button"
                  variant="outline"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <History className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{food.name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatCalories(food.caloriesPerUnit)} mỗi {food.unit}
                        {food.proteinG !== undefined && ` · P: ${food.proteinG}g C: ${food.carbsG}g F: ${food.fatG}g`}
                      </span>
                    </span>
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Chọn
                  </span>
                </Button>
              ))
            )}
          </div>
        )}

        {activeTab === "custom" && (
          <div className="space-y-4">
            <CreateCustomFoodDialog initialName={query} onCreated={handleCustomFoodCreated} />
            <div className="grid gap-2">
              {customFoods.length === 0 ? (
                <StateBlock
                  description="Bạn chưa tạo món ăn tùy chỉnh nào. Tự tạo món ăn đặc trưng của riêng bạn bằng cách nhấn nút phía trên."
                  title="Chưa có món ăn tự tạo"
                  tone="empty"
                />
              ) : (
                customFoods.map((food) => (
                  <Button
                    className="h-auto justify-between gap-4 rounded-xl border-border bg-background p-4 text-left text-foreground hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98] data-[selected=true]:border-primary data-[selected=true]:bg-primary/10"
                    data-selected={selectedFoodId === food.id}
                    key={`custom-${food.id}`}
                    onClick={() => onSelectFood(food)}
                    type="button"
                    variant="outline"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Heart className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{food.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {formatCalories(food.caloriesPerUnit)} mỗi {food.unit}
                          {food.proteinG !== undefined && ` · P: ${food.proteinG}g C: ${food.carbsG}g F: ${food.fatG}g`}
                        </span>
                      </span>
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Chọn
                    </span>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nutrition preview & confirm dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 border border-white/20 bg-background/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader className="border-b border-border p-6">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Utensils aria-hidden="true" className="size-4" />
              </span>
              Xem trước dinh dưỡng sản phẩm
            </DialogTitle>
            <DialogDescription className="mt-1">
              Sản phẩm tìm thấy từ tra cứu trực tuyến. Bạn có thể chỉnh sửa lại trước khi thêm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="preview-name">
                Tên sản phẩm
              </label>
              <Input
                id="preview-name"
                className="min-h-11 w-full bg-background px-3 text-sm border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="preview-unit">
                  Đơn vị tính (Serving size)
                </label>
                <Input
                  id="preview-unit"
                  className="min-h-11 w-full bg-background px-3 text-sm border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                  value={previewUnit}
                  onChange={(e) => setPreviewUnit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="preview-calories">
                  Calo mỗi đơn vị
                </label>
                <Input
                  id="preview-calories"
                  type="number"
                  className="min-h-11 w-full bg-background px-3 text-sm border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                  value={previewCalories}
                  onChange={(e) => setPreviewCalories(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="preview-carbs">
                  Carbs (g)
                </label>
                <Input
                  id="preview-carbs"
                  type="number"
                  className="min-h-11 w-full bg-background px-3 text-sm border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                  value={previewCarbs}
                  onChange={(e) => setPreviewCarbs(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="preview-protein">
                  Protein (g)
                </label>
                <Input
                  id="preview-protein"
                  type="number"
                  className="min-h-11 w-full bg-background px-3 text-sm border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                  value={previewProtein}
                  onChange={(e) => setPreviewProtein(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="preview-fat">
                  Fat (g)
                </label>
                <Input
                  id="preview-fat"
                  type="number"
                  className="min-h-11 w-full bg-background px-3 text-sm border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                  value={previewFat}
                  onChange={(e) => setPreviewFat(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setIsPreviewOpen(false)
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                disabled={isSavingProduct}
                className="rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
                onClick={handleConfirmProduct}
              >
                {isSavingProduct ? "Đang lưu..." : "Xác nhận và Chọn"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
            <Input
              id="custom-food-name"
              className="min-h-11 w-full bg-background px-3 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
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
              <Input
                id="custom-food-unit"
                className="min-h-11 w-full bg-background px-3 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
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
              <Input
                id="custom-food-calories"
                type="number"
                className="min-h-11 w-full bg-background px-3 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
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
              <Input
                id="custom-food-carbs"
                type="number"
                className="min-h-11 w-full bg-background px-3 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                {...register("carbsG")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground text-xs" htmlFor="custom-food-protein">
                Protein (g)
              </label>
              <Input
                id="custom-food-protein"
                type="number"
                className="min-h-11 w-full bg-background px-3 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                {...register("proteinG")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground text-xs" htmlFor="custom-food-fat">
                Fat (g)
              </label>
              <Input
                id="custom-food-fat"
                type="number"
                className="min-h-11 w-full bg-background px-3 text-sm text-foreground border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
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
