"use client";

import { useState, useEffect } from "react";
import { useSidebarStore } from "@/stores/useSideBarStore";

/**
 * Resolves a CSS value string (which may contain var() references) to the
 * browser-computed colour by briefly mounting a hidden <span> and reading
 * its computed `color` property.  Returns an rgb() string usable anywhere —
 * including SVG presentation attributes that don't support CSS variables.
 */
function resolveColor(cssValue: string): string {
  if (typeof window === "undefined") return "transparent";
  const el = document.createElement("span");
  el.setAttribute(
    "style",
    `color: ${cssValue}; position: absolute; width: 0; height: 0; visibility: hidden; pointer-events: none;`,
  );
  document.body.appendChild(el);
  const resolved = getComputedStyle(el).color;
  document.body.removeChild(el);
  return resolved;
}

export interface ChartColorPalette {
  /** Primary accent — bar fills, active ring, primary line */
  primary: string;
  /** Second data series */
  chart2: string;
  /** Third data series */
  chart3: string;
  /** Fourth data series */
  chart4: string;
  /** Fifth data series */
  chart5: string;
  /** Muted surface — donut/ring background segment */
  muted: string;
  /** Axis tick labels */
  mutedFg: string;
  /** CartesianGrid lines */
  border: string;
  /** Tooltip popup background */
  cardBg: string;
  /** Tooltip popup text */
  cardFg: string;
}

function buildPalette(): ChartColorPalette {
  return {
    primary: resolveColor("var(--primary)"),
    chart2: resolveColor("var(--chart-2)"),
    chart3: resolveColor("var(--chart-3)"),
    chart4: resolveColor("var(--chart-4)"),
    chart5: resolveColor("var(--chart-5)"),
    muted: resolveColor("var(--muted)"),
    mutedFg: resolveColor("var(--muted-foreground)"),
    border: resolveColor("var(--border)"),
    cardBg: resolveColor("var(--card)"),
    cardFg: resolveColor("var(--card-foreground)"),
  };
}

/** Lime-theme defaults used during SSR / before first client paint */
const SSR_DEFAULTS: ChartColorPalette = {
  primary: "oklch(0.66 0.19 142)",
  chart2: "oklch(0.58 0.095 210)",
  chart3: "oklch(0.72 0.14 80)",
  chart4: "oklch(0.64 0.18 28)",
  chart5: "oklch(0.32 0.025 145)",
  muted: "oklch(0.94 0.012 145)",
  mutedFg: "oklch(0.44 0.018 145)",
  border: "oklch(0.88 0.012 145)",
  cardBg: "oklch(1 0 0)",
  cardFg: "oklch(0.16 0.015 145)",
};

/**
 * Returns a resolved colour palette that automatically updates whenever the
 * user switches `theme` (light / dark) or `colorPreset` (lime / steel / orange).
 *
 * All values are real browser-computed colours (rgb() strings) safe to pass
 * directly to Recharts `fill`, `stroke`, and `contentStyle` props.
 */
export function useChartColors(): ChartColorPalette {
  const { theme, colorPreset } = useSidebarStore();

  const [palette, setPalette] = useState<ChartColorPalette>(() =>
    typeof window !== "undefined" ? buildPalette() : SSR_DEFAULTS,
  );

  useEffect(() => {
    // Run after the DOM has applied the new theme class so getComputedStyle
    // reads the correct resolved values.
    setPalette(buildPalette());
  }, [theme, colorPreset]);

  return palette;
}
