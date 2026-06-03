"use client";

import { useState } from "react";
import { Scale, X, Activity, Award } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function TdeeCalculator({ isOpen, onClose, onTargetApplied }: TdeeCalculatorProps) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(25);
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [activity, setActivity] = useState<number>(1.55);

  const [tdee, setTdee] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [proposedCalorie, setProposedCalorie] = useState<number>(2000);

  // Validation calculated on the fly during render to avoid synchronous useEffect state updates
  const errors: { height?: string; weight?: string; age?: string } = {};
  let isValid = true;

  if (height < 50 || height > 250) {
    errors.height = "Chiều cao phải từ 50cm đến 250cm";
    isValid = false;
  }
  if (weight < 20 || weight > 300) {
    errors.weight = "Cân nặng phải từ 20kg đến 300kg";
    isValid = false;
  }
  if (age < 10 || age > 100) {
    errors.age = "Tuổi phải từ 10 đến 100 tuổi";
    isValid = false;
  }

  function calculateTdee() {
    if (!isValid) return;

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

  function handleApply() {
    if (typeof window !== "undefined") {
      localStorage.setItem("gymmaster-calorie-goal", proposedCalorie.toString());
      onTargetApplied(proposedCalorie);
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Scale className="size-4" />
            </span>
            <h3 className="text-lg font-bold text-foreground">Tính mục tiêu Calo & TDEE</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition active:scale-95"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Gender selection */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                    : "border-border bg-background hover:bg-muted"
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
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                Nữ
              </button>
            </div>
          </div>

          {/* Age, Height, Weight inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="tdee-age" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tuổi
              </label>
              <input
                id="tdee-age"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className={cn(
                  "mt-2 min-h-11 w-full rounded-xl border bg-background px-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-primary/10",
                  errors.age ? "border-destructive focus:border-destructive" : "border-border focus:border-primary/50"
                )}
              />
            </div>
            <div>
              <label htmlFor="tdee-height" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Chiều cao (cm)
              </label>
              <input
                id="tdee-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className={cn(
                  "mt-2 min-h-11 w-full rounded-xl border bg-background px-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-primary/10",
                  errors.height ? "border-destructive focus:border-destructive" : "border-border focus:border-primary/50"
                )}
              />
            </div>
            <div>
              <label htmlFor="tdee-weight" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cân nặng (kg)
              </label>
              <input
                id="tdee-weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className={cn(
                  "mt-2 min-h-11 w-full rounded-xl border bg-background px-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-primary/10",
                  errors.weight ? "border-destructive focus:border-destructive" : "border-border focus:border-primary/50"
                )}
              />
            </div>
          </div>

          {/* Validation warnings */}
          {(errors.age || errors.height || errors.weight) && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
              {errors.age && <p>{errors.age}</p>}
              {errors.height && <p>{errors.height}</p>}
              {errors.weight && <p>{errors.weight}</p>}
            </div>
          )}

          {/* Activity Multiplier */}
          <div>
            <label htmlFor="tdee-activity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mức độ vận động
            </label>
            <select
              id="tdee-activity"
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
              className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            >
              {activityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {activityOptions.find((o) => o.value === activity)?.desc}
            </p>
          </div>

          {/* Action button to calculate */}
          <button
            type="button"
            onClick={calculateTdee}
            disabled={!isValid}
            className="min-h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:brightness-95 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none"
          >
            Tính chỉ số TDEE
          </button>

          {/* Calculations Result */}
          {tdee !== null && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <Activity className="size-3.5 text-primary" />
                    Chỉ số TDEE tính toán:
                  </h4>
                  <p className="text-xs text-muted-foreground">Năng lượng tiêu thụ hàng ngày</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">{tdee}</span>
                  <span className="text-xs text-muted-foreground"> kcal</span>
                </div>
              </div>

              {/* Goal Chooser */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mục tiêu năng lượng
                </span>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleGoalChange("lose")}
                    className={cn(
                      "py-2 px-1 rounded-xl border text-xs font-bold transition active:scale-95",
                      selectedGoal === "lose"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    Giảm cân
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoalChange("maintain")}
                    className={cn(
                      "py-2 px-1 rounded-xl border text-xs font-bold transition active:scale-95",
                      selectedGoal === "maintain"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    Duy trì
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoalChange("gain")}
                    className={cn(
                      "py-2 px-1 rounded-xl border text-xs font-bold transition active:scale-95",
                      selectedGoal === "gain"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    Tăng cân
                  </button>
                </div>
              </div>

              {/* Summary and Apply CTA */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Mục tiêu Calo đề xuất:</p>
                  <p className="text-lg font-black text-foreground">{proposedCalorie} kcal/ngày</p>
                  <p className="text-[10px] text-muted-foreground">
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
      </div>
    </div>
  );
}
