import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className={`relative inline-flex cursor-pointer items-center ${disabled ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="h-7 w-12 rounded-[var(--radius-pill)] bg-[var(--msc-border)] transition-colors peer-checked:bg-[var(--msc-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--msc-primary)] peer-disabled:pointer-events-none" />
      <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

export default function Profile() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [emailNotif, setEmailNotif] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(true);

  return (
    <div className="msc-page-bg">
      <div className="msc-animate-page msc-inner pb-16">
        <Navbar />
        <main className="msc-section-pad mx-auto max-w-[800px]">
          <p className="mb-8 text-center font-sans text-[13px] text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--msc-primary)]">
              Dashboard
            </Link>
            <span className="mx-1.5">&gt;</span>
            Profile
          </p>

          <article
            className="rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-10 shadow-[var(--shadow-md)] md:flex md:gap-10"
            style={{ borderTopWidth: 1 }}
          >
            <div className="mb-10 flex shrink-0 flex-col items-center md:mb-0 md:items-start">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#0d9488] md:h-[96px] md:w-[96px]">
                  <span className="font-display text-3xl font-bold text-white">JD</span>
                </div>
                <span
                  className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-green-500"
                  title="Online"
                />
              </div>
              <button
                type="button"
                className="mx-auto mt-8 hidden rounded-[var(--radius-pill)] border-[1.5px] border-[var(--msc-primary)] px-4 py-2 font-sans text-sm font-semibold text-[var(--msc-primary)] md:mx-0 md:inline-flex"
              >
                Edit Profile
              </button>
            </div>

            <div className="min-w-0 flex-1 text-center md:text-left">
              <div className="mb-6 flex flex-col items-center gap-3 md:flex-row md:justify-end">
                <button
                  type="button"
                  className="inline-flex rounded-[var(--radius-pill)] border-[1.5px] border-[var(--msc-primary)] px-4 py-2 font-sans text-sm font-semibold text-[var(--msc-primary)] md:hidden"
                >
                  Edit Profile
                </button>
              </div>
              <h1 className="font-display text-3xl font-bold text-[var(--text-heading)] md:text-[28px]">
                John Doe
              </h1>
              <p className="mt-2 font-sans text-sm text-[var(--text-muted)]">Healthcare Professional</p>
              <p className="mt-2 font-sans text-[13px] text-[var(--text-body)]">
                📧 john.doe@example.com
              </p>
            </div>
          </article>

          <div className="mt-8 grid divide-y divide-[var(--msc-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-[var(--msc-border)]">
            {[
              { n: "12", l: "Assessments Run" },
              { n: "3", l: "Drug Searches" },
              { n: "2024", l: "Member Since" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col items-center px-6 py-5 text-center">
                <span className="font-mono text-xl font-bold text-[var(--msc-primary)]">{s.n}</span>
                <span className="mt-1 font-sans text-[13px] text-[var(--text-muted)]">{s.l}</span>
              </div>
            ))}
          </div>

          <section className="mt-14">
            <h2 className="font-display text-xl font-bold text-[var(--text-heading)]">Recent Activity</h2>
            <ul className="mt-6 space-y-3">
              {[
                ["🫀", "Heart Risk Assessment", "Low Risk Result", "2 days ago"],
                ["💊", "Drug Search", "Metformin alternatives", "5 days ago"],
                ["🧬", "Disease Prediction", "Cold / flu pattern noted", "1 week ago"],
              ].map(([icon, title, sub, time]) => (
                <li
                  key={title}
                  className="flex items-center gap-4 rounded-[10px] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[var(--msc-primary-light)] text-lg">
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans font-semibold text-[var(--text-heading)]">{title}</p>
                    <p className="font-sans text-sm text-[var(--text-muted)]">{sub}</p>
                  </div>
                  <div className="hidden flex-col items-end gap-1 sm:flex">
                    <span className="rounded-[var(--radius-pill)] bg-[var(--msc-accent-teal-light)] px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase text-[var(--msc-accent-teal)]">
                      Completed
                    </span>
                    <span className="font-sans text-[11px] text-[var(--text-muted)]">{time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14 rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-sm)]">
            <h2 className="font-display text-xl font-bold text-[var(--text-heading)]">Account Preferences</h2>
            <div className="mt-2 divide-y divide-[var(--msc-border)]">
              <div className="flex items-center justify-between py-4">
                <span className="font-sans text-sm text-[var(--text-body)]">Email Notifications</span>
                <Toggle checked={emailNotif} onChange={() => setEmailNotif((v) => !v)} />
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="font-sans text-sm text-[var(--text-body)]">Dark Mode</span>
                <Toggle
                  checked={mounted && resolvedTheme === "dark"}
                  onChange={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  disabled={!mounted}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="font-sans text-sm text-[var(--text-body)]">Data Privacy Mode</span>
                <Toggle checked={privacyMode} onChange={() => setPrivacyMode((v) => !v)} />
              </div>
            </div>
          </section>

          <div className="mt-14 flex justify-center">
            <button
              type="button"
              className="rounded-[var(--radius-pill)] border-[1.5px] border-[var(--msc-danger)] px-8 py-2.5 font-sans text-sm font-semibold text-[var(--msc-danger)] transition-colors hover:bg-[var(--msc-danger-light)]"
            >
              Sign Out
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
