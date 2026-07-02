"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  const [step, setStep] = useState<"input" | "result">("input");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [neck, setNeck] = useState<number>(37);
  const [waist, setWaist] = useState<number>(80);
  const [hip, setHip] = useState<number>(90); // Only for women
  const [sweepAngle, setSweepAngle] = useState(-90);

  // Bypass animations in tests to prevent timeline flakes
  const isTest =
    typeof window !== "undefined" &&
    (!!(window as unknown as Record<string, unknown>).__vitest__ ||
      !!(window as unknown as Record<string, unknown>).__PLAYWRIGHT__);

  // 1. Calculate BMI
  const heightM = height / 100;
  const bmi = heightM > 0 ? Number((weight / (heightM * heightM)).toFixed(1)) : 0;

  // 2. Classify BMI
  let bmiClass = "Bình thường";
  let bmiColor = "text-primary";
  if (bmi < 18.5) {
    bmiClass = "Thiếu cân";
    bmiColor = "text-[var(--status-info)]";
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
  const needleAngle = -90 + (bmiPercent / 100) * 180;

  useEffect(() => {
    if (step === "result") {
      if (isTest) {
        const timer = setTimeout(() => {
          setSweepAngle(needleAngle);
        }, 0);
        return () => clearTimeout(timer);
      }
      const t1 = setTimeout(() => {
        setSweepAngle(-90);
      }, 0);
      const t2 = setTimeout(() => {
        setSweepAngle(needleAngle);
      }, 50);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [step, needleAngle, isTest]);

  const handleOpenChange = (newOpen: boolean) => {

    onOpenChange(newOpen);
    if (!newOpen) {
      setStep("input");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gm-dialog-surface gm-dialog-dark max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto p-6 text-white sm:max-w-[40rem]">
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            📊 Bộ đo Chỉ số Cơ thể BMI & Mỡ (Body Fat)
          </DialogTitle>
          <DialogDescription className="text-xs text-white/50">
            Tính toán chỉ số khối cơ thể (BMI) và tỷ lệ phần trăm mỡ theo chuẩn Hải quân Hoa Kỳ.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {step === "input" ? (
              <motion.div
                key="input"
                initial={isTest ? {} : { opacity: 0, y: 12 }}
                animate={isTest ? {} : { opacity: 1, y: 0 }}
                exit={isTest ? {} : { opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
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
                    <Slider
                      min={120}
                      max={220}
                      step={1}
                      value={[height]}
                      onValueChange={(val) => setHeight(val[0])}
                      className="py-2"
                    />
                  </div>

                  {/* Weight Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-white/70">
                      <span>Cân nặng:</span>
                      <span className="font-bold text-white">{weight} kg</span>
                    </div>
                    <Slider
                      min={30}
                      max={150}
                      step={1}
                      value={[weight]}
                      onValueChange={(val) => setWeight(val[0])}
                      className="py-2"
                    />
                  </div>

                  {/* Neck Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-white/70">
                      <span>Vòng cổ:</span>
                      <span className="font-bold text-white">{neck} cm</span>
                    </div>
                    <Slider
                      min={25}
                      max={55}
                      step={1}
                      value={[neck]}
                      onValueChange={(val) => setNeck(val[0])}
                      className="py-2"
                    />
                  </div>

                  {/* Waist Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-white/70">
                      <span>Vòng eo:</span>
                      <span className="font-bold text-white">{waist} cm</span>
                    </div>
                    <Slider
                      min={50}
                      max={130}
                      step={1}
                      value={[waist]}
                      onValueChange={(val) => setWaist(val[0])}
                      className="py-2"
                    />
                  </div>

                  {/* Hip Slider (Only for women) */}
                  {gender === "female" && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-white/70">
                        <span>Vòng mông:</span>
                        <span className="font-bold text-white">{hip} cm</span>
                      </div>
                      <Slider
                        min={60}
                        max={140}
                        step={1}
                        value={[hip]}
                        onValueChange={(val) => setHip(val[0])}
                        className="py-2"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setStep("result")}
                  className="w-full min-h-[50px] rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-95 active:scale-[0.98] transition"
                >
                  Xem kết quả
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={isTest ? {} : { opacity: 0, y: 12 }}
                animate={isTest ? {} : { opacity: 1, y: 0 }}
                exit={isTest ? {} : { opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Real-time Display Gauge Panel */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-inner relative overflow-hidden">
                  
                  {/* SVG Speedometer Gauge */}
                  <div className="relative w-48 h-28 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      {/* Arc Track */}
                      <path
                        d="M 15 45 A 35 35 0 0 1 85 45"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      
                      {/* Colored segments approximations */}
                      <path
                        d="M 15 45 A 35 35 0 0 1 20.16 26.71"
                        fill="none"
                        stroke="#06b6d4" // Thiếu cân
                        strokeWidth="8"
                      />
                      <path
                        d="M 20.16 26.71 A 35 35 0 0 1 50 10"
                        fill="none"
                        stroke="#10b981" // Bình thường
                        strokeWidth="8"
                      />
                      <path
                        d="M 50 10 A 35 35 0 0 1 74.75 20.25"
                        fill="none"
                        stroke="#f59e0b" // Thừa cân
                        strokeWidth="8"
                      />
                      <path
                        d="M 74.75 20.25 A 35 35 0 0 1 85 45"
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
                          transform: `rotate(${sweepAngle}deg)`,
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
                  <div className="mt-6 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white/60 leading-relaxed text-center w-full">
                    {bmiClass === "Bình thường"
                      ? "Chỉ số BMI lý tưởng! Hãy duy trì tập luyện đều đặn và chế độ ăn cân bằng protein."
                      : bmiClass === "Thiếu cân"
                      ? "Bạn cần bổ sung dinh dưỡng calo dồi dào. Tăng cường tập tạ kháng lực để xây cơ."
                      : "Hãy tăng cường tập cardio kết hợp tập tạ, đồng thời kiểm soát giảm lượng calo nạp vào."}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setStep("input")}
                  className="w-full min-h-[50px] rounded-xl border-white/10 hover:bg-white/5 hover:text-white text-white/80 active:scale-[0.98] font-bold flex items-center justify-center gap-2 transition"
                >
                  <ArrowLeft className="size-4" />
                  Thay đổi chỉ số (Đo lại)
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
