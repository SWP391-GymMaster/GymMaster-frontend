"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BmiCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BmiCalculator({ open, onOpenChange }: BmiCalculatorProps) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [neck, setNeck] = useState<number>(37);
  const [waist, setWaist] = useState<number>(80);
  const [hip, setHip] = useState<number>(90); // Only for women

  // 1. Calculate BMI
  const heightM = height / 100;
  const bmi = heightM > 0 ? Number((weight / (heightM * heightM)).toFixed(1)) : 0;

  // 2. Classify BMI
  let bmiClass = "Bình thường";
  let bmiColor = "text-emerald-500";
  if (bmi < 18.5) {
    bmiClass = "Thiếu cân";
    bmiColor = "text-cyan-500";
  } else if (bmi >= 25 && bmi < 30) {
    bmiClass = "Thừa cân";
    bmiColor = "text-amber-500";
  } else if (bmi >= 30) {
    bmiClass = "Béo phì";
    bmiColor = "text-red-500";
  }

  // 3. Navy Body Fat Calculation
  const calculateBodyFat = () => {
    try {
      if (gender === "male") {
        const diff = waist - neck;
        if (diff <= 0) return 15;
        const density = 1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(height);
        const bf = 495 / density - 450;
        return isNaN(bf) ? 15 : Number(Math.max(2, Math.min(bf, 50)).toFixed(1));
      } else {
        const diff = waist + hip - neck;
        if (diff <= 0) return 22;
        const density = 1.29579 - 0.35004 * Math.log10(diff) + 0.22100 * Math.log10(height);
        const bf = 495 / density - 450;
        return isNaN(bf) ? 22 : Number(Math.max(2, Math.min(bf, 60)).toFixed(1));
      }
    } catch {
      return gender === "male" ? 15 : 22;
    }
  };

  const bodyFat = calculateBodyFat();

  // Helper values for drawing circular SVG needle
  // BMI scale from 15 (0%) to 35 (100%)
  const minBmi = 15;
  const maxBmi = 35;
  const bmiPercent = Math.max(0, Math.min(100, ((bmi - minBmi) / (maxBmi - minBmi)) * 100));
  // Angle from -180 deg to 0 deg for needle
  const needleAngle = -180 + (bmiPercent / 100) * 180;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950/95 border border-white/10 text-white rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            📊 Bộ đo Chỉ số Cơ thể BMI & Mỡ (Body Fat)
          </DialogTitle>
          <DialogDescription className="text-xs text-white/50">
            Tính toán chỉ số khối cơ thể (BMI) và tỷ lệ phần trăm mỡ theo chuẩn Hải quân Hoa Kỳ.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4">
          
          {/* Sliders Input Panel */}
          <div className="space-y-4">
            {/* Gender Switch */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  gender === "male" ? "bg-primary text-primary-foreground shadow" : "text-white/60 hover:text-white"
                }`}
              >
                Nam
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  gender === "female" ? "bg-primary text-primary-foreground shadow" : "text-white/60 hover:text-white"
                }`}
              >
                Nữ
              </button>
            </div>

            {/* Height Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-white/70">
                <span>Chiều cao:</span>
                <span className="font-bold text-white">{height} cm</span>
              </div>
              <input
                type="range"
                min="120"
                max="220"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Weight Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-white/70">
                <span>Cân nặng:</span>
                <span className="font-bold text-white">{weight} kg</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Neck Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-white/70">
                <span>Vòng cổ:</span>
                <span className="font-bold text-white">{neck} cm</span>
              </div>
              <input
                type="range"
                min="25"
                max="55"
                value={neck}
                onChange={(e) => setNeck(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Waist Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-white/70">
                <span>Vòng eo:</span>
                <span className="font-bold text-white">{waist} cm</span>
              </div>
              <input
                type="range"
                min="50"
                max="130"
                value={waist}
                onChange={(e) => setWaist(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Hip Slider (Only for women) */}
            {gender === "female" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-white/70">
                  <span>Vòng mông:</span>
                  <span className="font-bold text-white">{hip} cm</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={hip}
                  onChange={(e) => setHip(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>

          {/* Real-time Display Gauge Panel */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-inner relative overflow-hidden">
            
            {/* SVG Speedometer Gauge */}
            <div className="relative w-48 h-28 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                {/* Arc Track */}
                <path
                  d="M 10 45 A 35 35 0 0 1 90 45"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Colored segments approximations */}
                <path
                  d="M 10 45 A 35 35 0 0 1 29 20"
                  fill="none"
                  stroke="#06b6d4" // Thiếu cân
                  strokeWidth="8"
                />
                <path
                  d="M 29 20 A 35 35 0 0 1 65 14"
                  fill="none"
                  stroke="#10b981" // Bình thường
                  strokeWidth="8"
                />
                <path
                  d="M 65 14 A 35 35 0 0 1 82 27"
                  fill="none"
                  stroke="#f59e0b" // Thừa cân
                  strokeWidth="8"
                />
                <path
                  d="M 82 27 A 35 35 0 0 1 90 45"
                  fill="none"
                  stroke="#ef4444" // Béo phì
                  strokeWidth="8"
                />

                {/* Needle Pin Center */}
                <circle cx="50" cy="45" r="4" fill="#ffffff" />
                
                {/* Gauge Needle */}
                <line
                  x1="50"
                  y1="45"
                  x2="50"
                  y2="15"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    transformOrigin: "50px 45px",
                    transform: `rotate(${needleAngle}deg)`,
                    transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </svg>

              {/* BMI score indicator */}
              <div className="absolute bottom-0 text-center">
                <span className="text-3xl font-extrabold tracking-tight">{bmi}</span>
                <p className={`text-xs font-bold ${bmiColor} mt-0.5`}>{bmiClass}</p>
              </div>
            </div>

            {/* Body Fat Display metrics */}
            <div className="mt-8 grid grid-cols-2 gap-4 w-full border-t border-white/5 pt-4 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/40">Tỷ lệ mỡ (Navy BF)</p>
                <span className="text-xl font-extrabold tracking-tight text-cyan-400 mt-1 block">
                  {bodyFat}%
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/40">Phân loại cân</p>
                <span className={`text-sm font-bold ${bmiColor} mt-1.5 block`}>
                  {bmiClass}
                </span>
              </div>
            </div>

            {/* Recommendations / Tips */}
            <div className="mt-6 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white/60 leading-relaxed text-center">
              {bmiClass === "Bình thường"
                ? "Chỉ số BMI lý tưởng! Hãy duy trì tập luyện đều đặn và chế độ ăn cân bằng protein."
                : bmiClass === "Thiếu cân"
                ? "Bạn cần bổ sung dinh dưỡng calo dồi dào. Tăng cường tập tạ kháng lực để xây cơ."
                : "Hãy tăng cường tập cardio kết hợp tập tạ, đồng thời kiểm soát giảm lượng calo nạp vào."}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
