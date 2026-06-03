"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface PageAnimateWrapperProps {
  children: ReactNode;
}

export function PageAnimateWrapper({ children }: PageAnimateWrapperProps) {
  // Bypass motion animations in automated test runs to prevent layout timing flakes
  const isTest =
    typeof window !== "undefined" &&
    (navigator.webdriver ||
      (window as any).__vitest__ ||
      (window as any).__PLAYWRIGHT__);

  if (isTest) {
    return <div data-testid="page-animate-fallback">{children}</div>;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
