"use client";

import { useEffect } from "react";
import { Play, Pause, X, SkipForward, Timer } from "lucide-react";
import { useRestTimerStore } from "@/stores/useRestTimerStore";

export function RestTimerOverlay() {
  const {
    secondsRemaining,
    duration,
    active,
    exerciseName,
    memberName,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
  } = useRestTimerStore();

  // Handle countdown interval
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [active, tick]);

  // If there's no active timer and no seconds left, do not render
  if (secondsRemaining <= 0) return null;

  const percentage = duration > 0 ? (secondsRemaining / duration) * 100 : 0;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div id="rest-timer-overlay" className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="w-[320px] rounded-[1.5rem] border border-white/70 bg-white/75 p-5 shadow-2xl backdrop-blur-md md:w-[350px]">
        {/* Progress Ring / Bar indicator */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Timer className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Đang nghỉ giữa hiệp
              </p>
              <h4 className="truncate text-sm font-bold text-foreground">
                {exerciseName || "Bài tập tiếp theo"}
              </h4>
              {memberName && (
                <p className="truncate text-xs text-muted-foreground">
                  Hội viên: {memberName}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
              {timeStr}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/50 pt-4">
          <button
            onClick={stopTimer}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted active:scale-95 transition"
            title="Hủy bỏ"
          >
            <X className="size-4" />
          </button>

          {active ? (
            <button
              onClick={pauseTimer}
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted active:scale-95 transition"
              title="Tạm dừng"
            >
              <Pause className="size-4" />
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:brightness-95 active:scale-95 transition"
              title="Tiếp tục"
            >
              <Play className="size-4" />
            </button>
          )}

          <button
            onClick={stopTimer} // Skip finishes the timer
            className="flex min-h-9 items-center gap-1.5 rounded-full bg-zinc-950 px-4 text-xs font-semibold text-white hover:bg-zinc-900 active:scale-[0.97] transition"
          >
            Bỏ qua
            <SkipForward className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
