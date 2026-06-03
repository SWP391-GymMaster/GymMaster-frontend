"use client";

import { X, Keyboard } from "lucide-react";
import { useShortcutsStore } from "@/stores/useShortcutsStore";

export function ShortcutsHelpOverlay() {
  const { isOpen, close } = useShortcutsStore();

  if (!isOpen) return null;

  const shortcutsList = [
    { keys: ["Alt", "C"], desc: "Điều hướng đến Terminal Check-in Lễ tân" },
    { keys: ["Alt", "S"], desc: "Điều hướng đến Stepper Bán gói tập mới" },
    { keys: ["Alt", "F"], desc: "Focus & bôi đen nhanh thanh Tìm kiếm Thành viên" },
    { keys: ["?"], desc: "Bật/Tắt bảng phím tắt trợ giúp này" },
    { keys: ["Esc"], desc: "Đóng bảng trợ giúp này bất cứ lúc nào" },
  ];

  return (
    <div
      id="shortcuts-help-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-zinc-900/90 p-8 shadow-2xl">
        <button
          onClick={close}
          className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition active:scale-95"
          title="Đóng"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Keyboard className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">Phím Tắt Hệ Thống</h3>
            <p className="text-xs text-white/50">GymMaster OS Keyboard Shortcuts</p>
          </div>
        </div>

        <div className="space-y-4">
          {shortcutsList.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <span className="text-sm text-white/70 font-medium">{sc.desc}</span>
              <div className="flex items-center gap-1">
                {sc.keys.map((key, kIdx) => (
                  <span key={kIdx} className="flex items-center">
                    {kIdx > 0 && <span className="text-white/30 text-xs px-0.5">+</span>}
                    <kbd className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded border border-white/15 bg-white/10 px-1.5 font-mono text-[10px] font-bold text-white shadow-sm">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-white/40">
          Nhấn phím bất kỳ hoặc bấm nút đóng để thoát bảng hướng dẫn này.
        </div>
      </div>
    </div>
  );
}
