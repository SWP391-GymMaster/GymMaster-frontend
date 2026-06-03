"use client";

import { create } from "zustand";

interface RestTimerState {
  secondsRemaining: number;
  duration: number;
  active: boolean;
  exerciseName: string;
  memberName: string;
  startTimer: (duration: number, exerciseName: string, memberName: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
}

export const useRestTimerStore = create<RestTimerState>((set, get) => ({
  secondsRemaining: 0,
  duration: 0,
  active: false,
  exerciseName: "",
  memberName: "",

  startTimer: (duration, exerciseName, memberName) => {
    set({
      secondsRemaining: duration,
      duration,
      active: true,
      exerciseName,
      memberName,
    });
  },

  pauseTimer: () => {
    set({ active: false });
  },

  resumeTimer: () => {
    if (get().secondsRemaining > 0) {
      set({ active: true });
    }
  },

  stopTimer: () => {
    set({
      secondsRemaining: 0,
      active: false,
      exerciseName: "",
      memberName: "",
    });
  },

  tick: () => {
    const { secondsRemaining, active } = get();
    if (!active) return;

    if (secondsRemaining <= 1) {
      // Alarm trigger should happen here
      set({ secondsRemaining: 0, active: false });
      triggerAlarm();
    } else {
      set({ secondsRemaining: secondsRemaining - 1 });
    }
  },
}));

function triggerAlarm() {
  if (typeof window === "undefined") return;

  // 1. Play Synthesized Bleep tone using Web Audio API
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      // Tone 1: High beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn("Failed to play rest timer synthesized audio: ", e);
  }

  // 2. Vibrate
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch (e) {
    console.warn("Failed to trigger vibration: ", e);
  }
}
