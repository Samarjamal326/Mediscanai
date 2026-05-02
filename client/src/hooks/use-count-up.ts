import { useEffect, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Animates numeric `value`; non-numeric values are echoed as-is. */
export function useCountUp(raw: number | string, durationMs = 1200, active = true) {
  const isNum = typeof raw === "number" && Number.isFinite(raw);
  const [display, setDisplay] = useState(isNum ? 0 : raw);

  useEffect(() => {
    if (!active) {
      setDisplay(raw);
      return;
    }
    if (!isNum) {
      setDisplay(raw);
      return;
    }
    const target = raw as number;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      setDisplay(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [raw, durationMs, active, isNum]);

  return display;
}
