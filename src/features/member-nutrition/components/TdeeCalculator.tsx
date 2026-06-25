"use client";

import { useState, useEffect } from "react";
import { Scale, Activity, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSetMemberCalorieTarget, useMemberCalorieTarget } from "@/features/member-nutrition/api/member-nutrition.queries";

type TdeeCalculatorProps = {
  isOpen: boolean;
  onClose: () => void;
  onTargetApplied: (newTarget: number) => void;
};

const activityOptions = [
  { value: 1.2, label: "Ít vận động", desc: "Làm việc văn phòng, ít tập luyện" },
  { value: 1.375, label: "Vận động nhẹ", desc: "Tập nhẹ nhàng 1-3 ngày/tuần" },
  { value: 1.55, label: "Vận động vừa", desc: "Tập luyện đều đặn 3-5 ngày/tuần" },
  { value: 1.725, label: "Vận động nhiều", desc: "Tập nặng cường độ cao 6-7 ngày/tuần" },
  { value: 1.9, label: "Vận động cực nặng", desc: "Tập nặng ngày 2 lần, vận động viên" },
];

const dietTemplates = {
  balanced: { label: "Truyền thống (30% P / 40% C / 30% F)", pRatio: 0.3, cRatio: 0.4, fRatio: 0.3 },
  lowcarb: { label: "Low Carb (35% P / 20% C / 45% F)", pRatio: 0.35, cRatio: 0.2, fRatio: 0.45 },
  keto: { label: "Keto (20% P / 5% C / 75% F)", pRatio: 0.2, cRatio: 0.05, fRatio: 0.75 },
  highprotein: { label: "Tăng cơ (40% P / 40% C / 20% F)", pRatio: 0.4, cRatio: 0.4, fRatio: 0.2 },
  custom: { label: "Tùy chỉnh (Nhập thủ công)", pRatio: 0, cRatio: 0, fRatio: 0 },
};

export function TdeeCalculator({ isOpen, onClose, onTargetApplied }: TdeeCalculatorProps) {
  // Spec 007 — luu muc tieu len backend (POST /members/{id}/calorie-target).
  const setTargetMutation = useSetMemberCalorieTarget();
  const { data: targetData } = useMemberCalorieTarget();

  const [activeTab, setActiveTab] = useState<"tdee" | "manual">("tdee");

  // TDEE Calculator state
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(25);
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [activity, setActivity] = useState<number>(1.55);

  const [tdee, setTdee] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [proposedCalorie, setProposedCalorie] = useState<number>(2000);

  // Manual goals state
  const [manualCalorie, setManualCalorie] = useState<number>(2200);
  const [manualProtein, setManualProtein] = useState<number>(140);
  const [manualCarbs, setManualCarbs] = useState<number>(270);
  const [manualFat, setManualFat] = useState<number>(75);
  const [dietTemplate, setDietTemplate] = useState<string>("balanced");

  // Prefill target values from backend when open
  useEffect(() => {
    if (isOpen && targetData) {
      const cal = targetData.dailyCalories ?? manualCalorie;
      const p = targetData.proteinG ?? manualProtein;
      const c = targetData.carbG ?? manualCarbs;
      const f = targetData.fatG ?? manualFat;

      setManualCalorie(cal);
      setProposedCalorie(cal);
      setManualProtein(p);
      setManualCarbs(c);
      setManualFat(f);

      // Determine if it matches any diet template
      let foundTemplate = "custom";
      for (const [key, temp] of Object.entries(dietTemplates)) {
        if (key === "custom") continue;
        const expectedP = Math.round((cal * temp.pRatio) / 4);
        const expectedC = Math.round((cal * temp.cRatio) / 4);
        const expectedF = Math.round((cal * temp.fRatio) / 9);
        if (Math.abs(expectedP - p) <= 2 && Math.abs(expectedC - c) <= 2 && Math.abs(expectedF - f) <= 2) {
          foundTemplate = key;
          break;
        }
      }
      setDietTemplate(foundTemplate);
    }
  }, [isOpen, targetData]);

  // Validation calculated on the fly during render for TDEE tab
  const tdeeErrors: { height?: string; weight?: string; age?: string } = {};
  let isTdeeValid = true;

  if (height < 50 || height > 250) {
    tdeeErrors.height = "Chiều cao phải từ 50cm đến 250cm";
    isTdeeValid = false;
  }
  if (weight < 20 || weight > 300) {
    tdeeErrors.weight = "Cân nặng phải từ 20kg đến 300kg";
    isTdeeValid = false;
  }
  if (age < 10 || age > 100) {
    tdeeErrors.age = "Tuổi phải từ 10 đến 100 tuổi";
    isTdeeValid = false;
  }

  // Validation for manual tab
  const isManualValid = manualCalorie >= 1200 && manualProtein >= 0 && manualCarbs >= 0 && manualFat >= 0;

  function calculateTdee() {
    if (!isTdeeValid) return;

    // Mifflin-St Jeor Formula
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const calculatedTdee = Math.round(bmr * activity);
    setTdee(calculatedTdee);
    updateProposedCalorie(calculatedTdee, selectedGoal);
  }

  function updateProposedCalorie(tdeeVal: number, goal: typeof selectedGoal) {
    let calorie = tdeeVal;
    if (goal === "lose") {
      calorie = tdeeVal - 500; // Deficit
    } else if (goal === "gain") {
      calorie = tdeeVal + 300; // Surplus
    }
    setProposedCalorie(Math.max(1200, calorie)); // Safety limit of 1200 kcal
  }

  function handleGoalChange(goal: typeof selectedGoal) {
    setSelectedGoal(goal);
    if (tdee !== null) {
      updateProposedCalorie(tdee, goal);
    }
  }

  function handleManualCalorieChange(val: number) {
    setManualCalorie(val);
    if (dietTemplate !== "custom") {
      const temp = dietTemplates[dietTemplate as keyof typeof dietTemplates];
      const pG = Math.round((val * temp.pRatio) / 4);
      const cG = Math.round((val * temp.cRatio) / 4);
      const fG = Math.round((val * temp.fRatio) / 9);
      setManualProtein(pG);
      setManualCarbs(cG);
      setManualFat(fG);
    }
  }

  function handleDietTemplateChange(templateKey: string) {
    setDietTemplate(templateKey);
    if (templateKey !== "custom") {
      const temp = dietTemplates[templateKey as keyof typeof dietTemplates];
      const pG = Math.round((manualCalorie * temp.pRatio) / 4);
      const cG = Math.round((manualCalorie * temp.cRatio) / 4);
      const fG = Math.round((manualCalorie * temp.fRatio) / 9);
      setManualProtein(pG);
      setManualCarbs(cG);
      setManualFat(fG);
    }
  }

  function handleApply() {
    if (activeTab === "tdee") {
      // Automatic calculation from TDEE
      let pRatio = 0.25;
      let cRatio = 0.5;
      let fRatio = 0.25;
      if (selectedGoal === "lose") {
        pRatio = 0.3;
        cRatio = 0.4;
        fRatio = 0.3;
      } else if (selectedGoal === "gain") {
        pRatio = 0.2;
        cRatio = 0.55;
        fRatio = 0.25;
      }

      const pG = Math.round((proposedCalorie * pRatio) / 4);
      const cG = Math.round((proposedCalorie * cRatio) / 4);
      const fG = Math.round((proposedCalorie * fRatio) / 9);

      setTargetMutation.mutate({
        dailyCalories: proposedCalorie,
        proteinG: pG,
        carbG: cG,
        fatG: fG,
      });

      onTargetApplied(proposedCalorie);
    } else {
      // Manual input
      setTargetMutation.mutate({
        dailyCalories: manualCalorie,
        proteinG: manualProtein,
        carbG: manualCarbs,
        fatG: manualFat,
      });

      onTargetApplied(manualCalorie);
    }
    onClose();
  }

  // Calculate total calories from macros input to show warning/comparison
  const manualCalorieSum = manualProtein * 4 + manualCarbs * 4 + manualFat * 9;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto bg-zinc-950/95 border border-white/10 text-white rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Scale className="size-4" />
            </span>
            <DialogTitle className="text-lg font-bold text-white">Tính mục tiêu Calo & TDEE</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/50">
            Tính toán chỉ số TDEE tự động hoặc tự thiết lập mục tiêu Calorie & Macros của riêng bạn.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("tdee")}
            className={cn(
              "py-2 px-3 text-xs font-bold rounded-lg transition active:scale-[0.98]",
              activeTab === "tdee"
                ? "bg-primary text-primary-foreground shadow"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            Tính TDEE tự động
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={cn(
              "py-2 px-3 text-xs font-bold rounded-lg transition active:scale-[0.98]",
              activeTab === "manual"
                ? "bg-primary text-primary-foreground shadow"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            Tự thiết lập (Manual)
          </button>
        </div>

        {activeTab === "tdee" ? (
          /* TDEE Tab */
          <div className="space-y-4 pr-1">
            {/* Gender selection */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                Giới tính
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={cn(
                    "min-h-11 rounded-xl border font-semibold text-sm transition active:scale-[0.97]",
                    gender === "male"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/10 bg-transparent hover:bg-white/5"
                  )}
                >
                  Nam
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={cn(
                    "min-h-11 rounded-xl border font-semibold text-sm transition active:scale-[0.97]",
                    gender === "female"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/10 bg-transparent hover:bg-white/5"
                  )}
                >
                  Nữ
                </button>
              </div>
            </div>

            {/* Age, Height, Weight inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="min-w-0">
                <label htmlFor="tdee-age" className="block text-[10px] font-bold uppercase tracking-wider text-white/40 truncate">
                  Tuổi
                </label>
                <Input
                  id="tdee-age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className={cn(
                    "mt-2 min-h-11 w-full bg-white/5 border text-white rounded-xl focus-visible:ring-primary/20",
                    tdeeErrors.age ? "border-destructive focus-visible:border-destructive" : "border-white/10 focus-visible:border-primary"
                  )}
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="tdee-height" className="block text-[10px] font-bold uppercase tracking-wider text-white/40 truncate">
                  Cao (cm)
                </label>
                <Input
                  id="tdee-height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className={cn(
                    "mt-2 min-h-11 w-full bg-white/5 border text-white rounded-xl focus-visible:ring-primary/20",
                    tdeeErrors.height ? "border-destructive focus-visible:border-destructive" : "border-white/10 focus-visible:border-primary"
                  )}
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="tdee-weight" className="block text-[10px] font-bold uppercase tracking-wider text-white/40 truncate">
                  Nặng (kg)
                </label>
                <Input
                  id="tdee-weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className={cn(
                    "mt-2 min-h-11 w-full bg-white/5 border text-white rounded-xl focus-visible:ring-primary/20",
                    tdeeErrors.weight ? "border-destructive focus-visible:border-destructive" : "border-white/10 focus-visible:border-primary"
                  )}
                />
              </div>
            </div>

            {/* Validation warnings */}
            {(tdeeErrors.age || tdeeErrors.height || tdeeErrors.weight) && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                {tdeeErrors.age && <p>{tdeeErrors.age}</p>}
                {tdeeErrors.height && <p>{tdeeErrors.height}</p>}
                {tdeeErrors.weight && <p>{tdeeErrors.weight}</p>}
              </div>
            )}

            {/* Activity Multiplier */}
            <div>
              <label htmlFor="tdee-activity" className="text-xs font-bold uppercase tracking-wider text-white/40">
                Mức độ vận động
              </label>
              
              <select
                id="tdee-activity"
                value={activity}
                onChange={(e) => setActivity(Number(e.target.value))}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              >
                {activityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>

              <Select
                value={activity.toString()}
                onValueChange={(val) => setActivity(Number(val))}
              >
                <SelectTrigger className="mt-2 min-h-11 w-full bg-white/5 border border-white/10 text-white rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary">
                  <SelectValue placeholder="Chọn mức độ vận động" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
                  {activityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()} className="focus:bg-white/5 focus:text-white">
                      {opt.label} ({opt.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-white/50">
                {activityOptions.find((o) => o.value === activity)?.desc}
              </p>
            </div>

            {/* Action button to calculate */}
            <button
              type="button"
              onClick={calculateTdee}
              disabled={!isTdeeValid}
              className="min-h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground hover:brightness-95 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none"
            >
              Tính chỉ số TDEE
            </button>

            {/* Calculations Result */}
            {tdee !== null && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-1">
                      <Activity className="size-3.5 text-primary" />
                      Chỉ số TDEE tính toán:
                    </h4>
                    <p className="text-xs text-white/40">Năng lượng tiêu thụ hàng ngày</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">{tdee}</span>
                    <span className="text-xs text-white/40"> kcal</span>
                  </div>
                </div>

                {/* Goal Chooser */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Mục tiêu thể chất & Phân bổ tỉ lệ Macro
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleGoalChange("lose")}
                      className={cn(
                        "py-2 px-1 rounded-xl border text-[11px] font-bold transition active:scale-95 flex flex-col items-center gap-0.5",
                        selectedGoal === "lose"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/10 bg-transparent hover:bg-white/5 text-white/60"
                      )}
                    >
                      <span>Giảm cân</span>
                      <span className="text-[9px] font-normal text-white/40">(30/40/30)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGoalChange("maintain")}
                      className={cn(
                        "py-2 px-1 rounded-xl border text-[11px] font-bold transition active:scale-95 flex flex-col items-center gap-0.5",
                        selectedGoal === "maintain"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/10 bg-transparent hover:bg-white/5 text-white/60"
                      )}
                    >
                      <span>Duy trì</span>
                      <span className="text-[9px] font-normal text-white/40">(25/50/25)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGoalChange("gain")}
                      className={cn(
                        "py-2 px-1 rounded-xl border text-[11px] font-bold transition active:scale-95 flex flex-col items-center gap-0.5",
                        selectedGoal === "gain"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/10 bg-transparent hover:bg-white/5 text-white/60"
                      )}
                    >
                      <span>Tăng cân</span>
                      <span className="text-[9px] font-normal text-white/40">(20/55/25)</span>
                    </button>
                  </div>
                </div>

                {/* Summary and Apply CTA */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white/40">Mục tiêu Calo đề xuất:</p>
                    <p className="text-lg font-black text-white">{proposedCalorie} kcal/ngày</p>
                    <p className="text-[10px] text-white/50">
                      {selectedGoal === "lose" ? "Hụt calo (-500 kcal) để giảm mỡ." : selectedGoal === "gain" ? "Thặng dư (+300 kcal) để xây cơ." : "Giữ cân bằng lượng calo tiêu thụ."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow hover:brightness-95 active:scale-95 transition"
                  >
                    <Award className="size-3.5" />
                    Áp dụng mục tiêu
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Manual Tab */
          <div className="space-y-4 pr-1">
            {/* Calorie goal target */}
            <div>
              <label htmlFor="manual-calorie" className="block text-xs font-bold uppercase tracking-wider text-white/40">
                Calo mục tiêu (kcal)
              </label>
              <Input
                id="manual-calorie"
                type="number"
                value={manualCalorie}
                onChange={(e) => handleManualCalorieChange(Math.max(0, Number(e.target.value)))}
                className="mt-2 min-h-11 w-full bg-white/5 border border-white/10 text-white rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
              />
              {manualCalorie < 1200 && (
                <p className="mt-1 text-xs text-destructive">Lượng calo tối thiểu khuyên dùng là 1200 kcal</p>
              )}
            </div>

            {/* Diet templates select */}
            <div>
              <label htmlFor="diet-template" className="text-xs font-bold uppercase tracking-wider text-white/40">
                Chế độ ăn mẫu (Diet Templates)
              </label>
              <Select value={dietTemplate} onValueChange={handleDietTemplateChange}>
                <SelectTrigger id="diet-template" className="mt-2 min-h-11 w-full bg-white/5 border border-white/10 text-white rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary">
                  <SelectValue placeholder="Chọn chế độ dinh dưỡng mẫu" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
                  {Object.entries(dietTemplates).map(([key, temp]) => (
                    <SelectItem key={key} value={key} className="focus:bg-white/5 focus:text-white">
                      {temp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gram inputs for Protein, Carbs, Fats */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="manual-protein" className="block text-[10px] font-bold uppercase tracking-wider text-white/40 truncate">
                  Protein (g) 🍖
                </label>
                <Input
                  id="manual-protein"
                  type="number"
                  value={manualProtein}
                  onChange={(e) => {
                    setManualProtein(Math.max(0, Number(e.target.value)));
                    setDietTemplate("custom");
                  }}
                  className="mt-2 min-h-11 w-full bg-white/5 border border-white/10 text-white rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                />
              </div>
              <div>
                <label htmlFor="manual-carbs" className="block text-[10px] font-bold uppercase tracking-wider text-white/40 truncate">
                  Carbs (g) 🍞
                </label>
                <Input
                  id="manual-carbs"
                  type="number"
                  value={manualCarbs}
                  onChange={(e) => {
                    setManualCarbs(Math.max(0, Number(e.target.value)));
                    setDietTemplate("custom");
                  }}
                  className="mt-2 min-h-11 w-full bg-white/5 border border-white/10 text-white rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                />
              </div>
              <div>
                <label htmlFor="manual-fat" className="block text-[10px] font-bold uppercase tracking-wider text-white/40 truncate">
                  Fats (g) 🍟
                </label>
                <Input
                  id="manual-fat"
                  type="number"
                  value={manualFat}
                  onChange={(e) => {
                    setManualFat(Math.max(0, Number(e.target.value)));
                    setDietTemplate("custom");
                  }}
                  className="mt-2 min-h-11 w-full bg-white/5 border border-white/10 text-white rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                />
              </div>
            </div>

            {/* Macro Equivalent info & warning banner */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50">Tổng Calo từ mục tiêu:</span>
                <span className="font-bold text-white">{manualCalorie} kcal</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50">Tổng Calo quy đổi từ Macro:</span>
                <span className={cn("font-bold", Math.abs(manualCalorieSum - manualCalorie) > 100 ? "text-amber-500" : "text-primary")}>
                  {manualCalorieSum} kcal
                </span>
              </div>
              <div className="pt-2 border-t border-white/5 grid grid-cols-3 text-center text-[10px] text-white/40">
                <div>Protein: {manualProtein * 4} kcal</div>
                <div>Carbs: {manualCarbs * 4} kcal</div>
                <div>Fats: {manualFat * 9} kcal</div>
              </div>

              {Math.abs(manualCalorieSum - manualCalorie) > 100 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-[10px] text-amber-500">
                  Lưu ý: Tổng calo quy đổi từ Macro ({manualCalorieSum} kcal) đang chênh lệch hơn 100 kcal so với Calo mục tiêu đã nhập ({manualCalorie} kcal).
                </div>
              )}
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={handleApply}
              disabled={!isManualValid}
              className="min-h-11 w-full rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-95 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
            >
              <Award className="size-4" />
              Áp dụng mục tiêu thủ công
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
