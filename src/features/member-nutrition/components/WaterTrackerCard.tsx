"use client";

import { useEffect, useState } from "react";
import { Droplet, Plus, RotateCcw, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOfflineSync } from "@/hooks/useOfflineSync";

const LOCAL_STORAGE_KEY_WATER = "gymmaster-water-logs";
const DAILY_GOAL_ML = 2000;

interface WaterLog {
  date: string; // YYYY-MM-DD
  amount: number; // ml
}

function getLocalDateString() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

function loadLogs(): WaterLog[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_WATER);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: WaterLog[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_WATER, JSON.stringify(logs));
  } catch (e) {
    console.warn("Failed to save water logs:", e);
  }
}

export function WaterTrackerCard() {
  const { isOnline, enqueueAction } = useOfflineSync();
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [todayAmount, setTodayAmount] = useState<number>(0);
  const todayStr = getLocalDateString();

  useEffect(() => {
    const loaded = loadLogs();
    
    // Find today's log
    const todayLog = loaded.find((l) => l.date === todayStr);

    const timer = setTimeout(() => {
      setLogs(loaded);
      setTodayAmount(todayLog ? todayLog.amount : 0);
    }, 0);

    return () => clearTimeout(timer);
  }, [todayStr]);

  const percentage = Math.min(Math.round((todayAmount / DAILY_GOAL_ML) * 100), 100);

  function handleAddWater(amount: number) {
    // Enqueue action for offline sync
    enqueueAction("ADD_WATER", { amount });

    // Tactile Feedback
    try {
      if ("vibrate" in navigator) {
        navigator.vibrate(30);
      }
    } catch {}

    const newAmount = todayAmount + amount;
    setTodayAmount(newAmount);

    const updatedLogs = [...logs];
    const todayIdx = updatedLogs.findIndex((l) => l.date === todayStr);
    
    if (todayIdx >= 0) {
      updatedLogs[todayIdx].amount = newAmount;
    } else {
      updatedLogs.push({ date: todayStr, amount: newAmount });
    }

    // Keep logs of the last 14 days to make sure we have 7 days of history
    const sorted = updatedLogs
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);

    setLogs(sorted);
    saveLogs(sorted);
  }

  function handleReset() {
    try {
      if ("vibrate" in navigator) {
        navigator.vibrate([50, 50]);
      }
    } catch {}

    setTodayAmount(0);
    const updatedLogs = logs.map((l) => 
      l.date === todayStr ? { ...l, amount: 0 } : l
    );
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  }

  // Get the last 7 days (including today) to draw the history chart
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    const dateStr = localDate.toISOString().split("T")[0];
    
    // Day label (Vietnamese: T2, T3, T4, T5, T6, T7, CN)
    const dayIndex = d.getDay();
    const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const label = dayLabels[dayIndex];

    const log = logs.find((l) => l.date === dateStr);
    return {
      date: dateStr,
      label,
      amount: log ? log.amount : 0,
      pct: log ? Math.min(Math.round((log.amount / DAILY_GOAL_ML) * 100), 100) : 0,
      isToday: dateStr === todayStr,
    };
  });

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <style>{`
        @keyframes waveMove {
          0% { transform: translate(-50%, 0) rotate(0deg); }
          100% { transform: translate(-50%, -5px) rotate(360deg); }
        }
        .animate-water-wave {
          animation: waveMove 8s linear infinite;
        }
        .animate-water-wave-fast {
          animation: waveMove 5s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
            <Droplet aria-hidden="true" className="size-4 fill-cyan-500" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Theo dõi nước</h3>
            <p className="text-xs text-muted-foreground">Mục tiêu: {DAILY_GOAL_ML}ml / ngày</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20 animate-pulse">
              <CloudOff className="size-3" />
              Ngoại tuyến
            </span>
          )}
          <button
            onClick={handleReset}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition"
            title="Reset hôm nay"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Content layout (Wave Visual + Info & CTAs) */}
      <div className="mt-4 grid grid-cols-[80px_1fr] gap-4 items-center">
        {/* Animated Glass Cylinder Container */}
        <div className="relative h-24 w-full overflow-hidden rounded-xl border border-cyan-500/30 bg-cyan-950/5">
          {/* Water content element */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-cyan-500/30 transition-all duration-700 ease-out"
            style={{ height: `${percentage}%` }}
          >
            {/* Wave 1 */}
            <div 
              className="absolute left-1/2 bottom-full h-[150px] w-[150px] rounded-[38%] bg-cyan-500/20 animate-water-wave"
              style={{ transform: "translate(-50%, 0)" }}
            />
            {/* Wave 2 */}
            <div 
              className="absolute left-1/2 bottom-full h-[140px] w-[140px] rounded-[42%] bg-cyan-500/30 animate-water-wave-fast"
              style={{ transform: "translate(-50%, 0)" }}
            />
          </div>
          
          {/* Percentage text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{percentage}%</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {todayAmount}ml
            </span>
          </div>
        </div>

        {/* Action console & info */}
        <div className="flex flex-col gap-2">
          <div className="text-right">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {todayAmount}
            </span>
            <span className="text-xs text-muted-foreground"> / {DAILY_GOAL_ML} ml</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAddWater(250)}
              className="flex items-center justify-center gap-1 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground transition hover:bg-muted active:scale-[0.96]"
            >
              <Plus className="size-3 text-cyan-500" />
              250ml
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="flex items-center justify-center gap-1 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground transition hover:bg-muted active:scale-[0.96]"
            >
              <Plus className="size-3 text-cyan-500" />
              500ml
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day History Chart */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Lịch sử 7 ngày qua
        </p>
        <div className="grid grid-cols-7 gap-1 items-end h-10">
          {last7Days.map((day) => (
            <div 
              key={day.date} 
              className="flex flex-col items-center gap-1 group relative cursor-pointer"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-zinc-950 text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none transition duration-150 z-10 whitespace-nowrap">
                {day.amount} ml
              </div>

              {/* Bar track */}
              <div className="w-full bg-muted rounded-full h-6 overflow-hidden relative border border-border/20">
                <div 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300",
                    day.isToday ? "bg-cyan-500" : day.pct >= 100 ? "bg-emerald-500" : "bg-cyan-500/40"
                  )}
                  style={{ height: `${day.pct}%` }}
                />
              </div>
              
              {/* Day label */}
              <span 
                className={cn(
                  "text-[9px] font-bold", 
                  day.isToday ? "text-cyan-500" : "text-muted-foreground"
                )}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
