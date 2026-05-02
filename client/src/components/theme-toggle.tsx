import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = { className?: string };

/** Icon-only toggle — avoids hydration mismatch via mounted gate. */
export function ThemeToggle({ className }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn("h-10 w-10 shrink-0 rounded-lg border border-[var(--msc-border)]", className)}
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--msc-border)] bg-[var(--bg-surface)] text-[var(--text-heading)] transition-[transform,color,background] hover:bg-[var(--bg-surface-2)] hover:scale-[1.03]",
        className,
      )}
      data-testid="button-theme-toggle"
    >
      <i className={`fas ${isDark ? "fa-sun text-amber-400" : "fa-moon text-[var(--text-muted)]"}`} />
    </button>
  );
}
