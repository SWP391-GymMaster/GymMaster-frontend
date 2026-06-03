"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Defer initial state updates out of the synchronous effect body
    const t0 = setTimeout(() => {
      setVisible(true);
      setProgress(15);
    }, 0);

    const t1 = setTimeout(() => {
      setProgress(45);
    }, 80);

    const t2 = setTimeout(() => {
      setProgress(75);
    }, 200);

    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
      }, 150);
    }, 450);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 top-0 z-[100] h-1 w-full bg-transparent pointer-events-none"
      data-testid="route-progress-bar"
    >
      <div
        className="h-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
