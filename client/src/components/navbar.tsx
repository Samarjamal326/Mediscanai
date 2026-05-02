import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/disease-prediction", label: "Disease Prediction" },
    { href: "/drug-recommendation", label: "Drug Finder" },
    { href: "/heart-assessment", label: "Heart Risk" },
    { href: "/reports", label: "Reports" },
    { href: "/medibot", label: "MediBot" },
  ];

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-[var(--nav-bg)] border-b border-[var(--nav-border)]"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 lg:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" data-testid="link-home">
          <span className="font-display text-xl font-bold leading-none tracking-tight md:text-[22px]">
            <span className="text-[var(--text-heading)]">Medi</span>
            <span className="text-[var(--msc-primary)]">SCAN</span>
            <span className="text-[var(--msc-accent-teal)]"> Ai</span>
          </span>
        </Link>

        <nav className="hidden h-full flex-1 items-center justify-center gap-x-5 md:flex">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`msc-nav-link whitespace-nowrap ${active ? "msc-nav-link-active" : ""}`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <Link href="/profile" data-testid="button-profile">
            <button
              type="button"
              className="hidden items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--msc-primary)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-[transform,box-shadow] duration-150 hover:scale-[1.03] hover:bg-[var(--msc-primary-hover)] hover:shadow-lg md:inline-flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs">
                <i className="fas fa-user text-white/95" aria-hidden />
              </span>
              Profile
            </button>
          </Link>
          <button
            type="button"
            className="inline-flex rounded-lg border border-[var(--msc-border)] p-2 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"} text-[var(--text-heading)]`} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[var(--nav-border)] bg-[var(--nav-bg)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active
                      ? "bg-[var(--msc-primary-light)] text-[var(--msc-primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/profile"
              className="mt-2 rounded-[var(--radius-pill)] bg-[var(--msc-primary)] py-3 text-center text-sm font-semibold text-white"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
