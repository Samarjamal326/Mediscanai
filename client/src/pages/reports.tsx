import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { diseasePredictionApi, drugRecommendationApi, heartAssessmentApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";

type RangeKey = "7" | "30" | "all";

function formatShort(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function diseaseName(p: { prediction?: unknown }) {
  const pred = p.prediction as { disease?: string } | null | undefined;
  return pred?.disease?.trim() || "Assessment recorded";
}

function diseaseConfidence(p: { prediction?: unknown }) {
  const pred = p.prediction as { confidence?: number } | null | undefined;
  const c = pred?.confidence;
  if (typeof c === "number" && Number.isFinite(c)) return `${Math.round(c)}%`;
  return null;
}

function drugAltCount(rec: { alternatives?: unknown }) {
  const a = rec.alternatives as { alternatives?: unknown[] } | null | undefined;
  if (a?.alternatives && Array.isArray(a.alternatives)) return a.alternatives.length;
  const raw = rec.alternatives as unknown[] | null | undefined;
  if (Array.isArray(raw)) return raw.length;
  return 0;
}

function riskLevelStyle(level: string) {
  const l = level?.toLowerCase() || "";
  if (l.includes("low"))
    return { bg: "#f0fdf4", fg: "#16a34a", bar: "#16a34a", pct: Math.min(35, Math.max(12, 25)) };
  if (l.includes("moderate") || l.includes("medium"))
    return { bg: "#fffbeb", fg: "#d97706", bar: "#d97706", pct: Math.min(75, Math.max(45, 60)) };
  if (l.includes("high"))
    return { bg: "#fef2f2", fg: "var(--msc-danger)", bar: "#dc2626", pct: Math.min(100, Math.max(70, 88)) };
  return { bg: "#f7f9fc", fg: "#64748b", bar: "#94a3b8", pct: 40 };
}

export default function Reports() {
  const [range, setRange] = useState<RangeKey>("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const { data: predRes, isLoading: lp } = useQuery({
    queryKey: ["/api/disease-predictions"],
    queryFn: diseasePredictionApi.getHistory,
  });
  const { data: drugRes, isLoading: lr } = useQuery({
    queryKey: ["/api/drug-recommendations"],
    queryFn: drugRecommendationApi.getHistory,
  });
  const { data: heartRes, isLoading: lh } = useQuery({
    queryKey: ["/api/heart-assessments"],
    queryFn: heartAssessmentApi.getHistory,
  });

  const predictions = predRes?.predictions ?? [];
  const drugs = drugRes?.recommendations ?? [];
  const hearts = heartRes?.assessments ?? [];

  const now = Date.now();
  const inRange = (d: Date) => {
    if (range === "all") return true;
    const days = range === "7" ? 7 : 30;
    return now - d.getTime() <= days * 86400000;
  };

  const parseDate = (x: unknown) => {
    if (!x) return new Date(0);
    const d = new Date(x as string);
    return Number.isNaN(d.getTime()) ? new Date(0) : d;
  };

  const merged = useMemo(() => {
    const items: Array<{
      sort: Date;
      type: "Disease Prediction" | "Drug Search" | "Heart Risk";
      id: string;
      raw: unknown;
    }> = [];
    for (const p of predictions) {
      const dt = parseDate((p as { createdAt?: string }).createdAt);
      if (!inRange(dt)) continue;
      items.push({
        sort: dt,
        type: "Disease Prediction",
        id: (p as { id: string }).id,
        raw: p,
      });
    }
    for (const p of drugs) {
      const dt = parseDate((p as { createdAt?: string }).createdAt);
      if (!inRange(dt)) continue;
      items.push({ sort: dt, type: "Drug Search", id: (p as { id: string }).id, raw: p });
    }
    for (const p of hearts) {
      const dt = parseDate((p as { createdAt?: string }).createdAt);
      if (!inRange(dt)) continue;
      items.push({ sort: dt, type: "Heart Risk", id: (p as { id: string }).id, raw: p });
    }
    items.sort((a, b) => b.sort.getTime() - a.sort.getTime());

    let list = items;
    if (typeFilter !== "All") {
      list = items.filter((i) =>
        typeFilter === "Disease"
          ? i.type === "Disease Prediction"
          : typeFilter === "Drug"
            ? i.type === "Drug Search"
            : typeFilter === "Heart"
              ? i.type === "Heart Risk"
              : true,
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => {
        const r = i.raw as Record<string, unknown>;
        if (i.type === "Disease Prediction") {
          return (
            diseaseName(r as never).toLowerCase().includes(q) ||
            (r.symptoms as string[])?.join(" ").toLowerCase().includes(q)
          );
        }
        if (i.type === "Drug Search") {
          return String(r.currentMedication || "").toLowerCase().includes(q);
        }
        const assessment = r.riskAssessment as { level?: string } | null;
        return (assessment?.level || "").toLowerCase().includes(q);
      });
    }
    return list;
  }, [predictions, drugs, hearts, range, search, typeFilter]);

  const totalAssessments = predictions.length + drugs.length + hearts.length;

  const allDates = useMemo(() => {
    const ds: Date[] = [];
    for (const p of [...predictions, ...drugs, ...hearts]) {
      ds.push(parseDate((p as { createdAt?: string }).createdAt));
    }
    return ds.sort((a, b) => b.getTime() - a.getTime());
  }, [predictions, drugs, hearts]);

  const lastAssessmentLabel = () => {
    const d = allDates[0];
    if (!d || d.getTime() === 0) return "—";
    const diffDays = Math.max(0, Math.floor((now - d.getTime()) / 86400000));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const riskFlagsCount = hearts.filter((h: { riskAssessment?: { level?: string } }) => {
    const ra = h.riskAssessment;
    const lv = ra?.level?.toLowerCase() || "";
    return lv.includes("high") || lv.includes("moderate") || lv.includes("medium");
  }).length;

  const uniqueConditions = useMemo(() => {
    const s = new Set<string>();
    for (const p of predictions) {
      const n = diseaseName(p as never);
      if (n !== "Assessment recorded") s.add(n);
    }
    return s.size;
  }, [predictions]);

  const nTotal = useCountUp(totalAssessments, 1200);
  const nRisk = useCountUp(riskFlagsCount, 1200);
  const nConditions = useCountUp(uniqueConditions, 1200);

  const monthBuckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of [...predictions, ...drugs, ...hearts]) {
      const d = parseDate((p as { createdAt?: string }).createdAt);
      if (d.getTime() === 0) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const keys = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    const max = Math.max(1, ...keys.map(([, vv]) => vv));
    return keys.map(([k, v]) => {
      const parts = k.split("-");
      const yy = Number(parts[0]);
      const mm = Number(parts[1]);
      const label = Number.isFinite(yy) && Number.isFinite(mm)
        ? new Date(yy, mm, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" })
        : k;
      return {
        key: k,
        label,
        count: v,
        hPct: Math.round((v / max) * 100),
      };
    });
  }, [predictions, drugs, hearts]);

  const [barHover, setBarHover] = useState<number | null>(null);

  const predSorted = [...predictions].sort(
    (a, b) =>
      parseDate((b as { createdAt?: string }).createdAt).getTime() -
      parseDate((a as { createdAt?: string }).createdAt).getTime(),
  );
  const drugSorted = [...drugs].sort(
    (a, b) =>
      parseDate((b as { createdAt?: string }).createdAt).getTime() -
      parseDate((a as { createdAt?: string }).createdAt).getTime(),
  );
  const heartSorted = [...hearts].sort(
    (a, b) =>
      parseDate((b as { createdAt?: string }).createdAt).getTime() -
      parseDate((a as { createdAt?: string }).createdAt).getTime(),
  );

  const avgPerMonth =
    monthBuckets.length > 0 ? (monthBuckets.reduce((s, x) => s + x.count, 0) / monthBuckets.length).toFixed(1) : "0";

  return (
    <div className="msc-page-bg">
      <div className="msc-animate-page msc-inner pb-20">
        <Navbar />
        <main className="mx-auto max-w-[1100px] px-4 pb-16 pt-28 md:pt-32 sm:px-6 lg:px-8">
          <div className="mb-2 text-center font-sans text-[12px] text-[var(--text-muted)] md:flex md:items-start md:justify-between md:text-left">
            <p className="md:order-2">
              <Link href="/" className="hover:text-[var(--msc-primary)]">
                Dashboard
              </Link>
              <span className="mx-1">&gt;</span>
              Reports
            </p>
          </div>

          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-display text-4xl font-extrabold text-[var(--text-heading)] md:text-[42px]">
                Reports &amp; History
              </h1>
              <p className="mt-3 max-w-xl font-sans text-base text-[var(--text-muted)]">
                A complete record of your AI-assisted health assessments (stored locally for this workspace).
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap justify-center gap-2 md:justify-end">
              {(
                [
                  ["7", "Last 7 Days"],
                  ["30", "Last 30 Days"],
                  ["all", "All Time"],
                ] as const
              ).map(([k, lab]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRange(k)}
                  className={cn(
                    "rounded-[var(--radius-pill)] border-[1.5px] px-4 py-2 font-sans text-[13px] font-medium transition-colors",
                    range === k
                      ? "border-[var(--msc-primary)] bg-[var(--msc-primary)] text-white shadow-sm"
                      : "border-[var(--msc-border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--msc-primary)]",
                  )}
                >
                  {lab}
                </button>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          <div className="mb-12 rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] px-8 py-7 shadow-[var(--shadow-md)]">
            <div className="grid grid-cols-1 divide-y divide-[var(--msc-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {[
                {
                  icon: "fa-clipboard-list",
                  box: "bg-[var(--msc-primary-light)] text-[var(--msc-primary)]",
                  label: "Total Assessments",
                  valueNum: typeof nTotal === "number" ? nTotal : 0,
                  valueStr: `${nTotal}`,
                  color: "text-[var(--msc-primary)]",
                },
                {
                  icon: "fa-clock",
                  box: "bg-[var(--bg-surface-2)] text-[var(--text-muted)]",
                  label: "Last Assessment",
                  valueNum: null,
                  valueStr: lastAssessmentLabel(),
                  color: "text-[var(--text-heading)]",
                },
                {
                  icon: "fa-triangle-exclamation",
                  box: "bg-[var(--msc-danger-light)] text-[var(--msc-danger)]",
                  label: "Risk Flags",
                  valueNum: typeof nRisk === "number" ? nRisk : 0,
                  valueStr: `${nRisk}`,
                  color: "text-[var(--msc-danger)]",
                },
                {
                  icon: "fa-dna",
                  box: "bg-[var(--msc-accent-teal-light)] text-[var(--msc-accent-teal)]",
                  label: "Conditions Detected",
                  valueNum: typeof nConditions === "number" ? nConditions : 0,
                  valueStr: `${nConditions}`,
                  color: "text-[var(--msc-accent-teal)]",
                },
              ].map((col, i, arr) => (
                <div
                  key={col.label}
                  className={cn(
                    "flex flex-col items-center px-4 py-6 text-center lg:items-stretch lg:px-6",
                    i < arr.length - 1 && "lg:border-r lg:border-[var(--msc-border)]",
                  )}
                >
                  <span
                    className={cn(
                      "mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] text-base lg:mx-0",
                      col.box,
                    )}
                  >
                    <i className={`fas ${col.icon}`} aria-hidden />
                  </span>
                  <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    {col.label}
                  </span>
                  <span
                    className={cn(
                      "mt-2 font-bold leading-tight",
                      col.valueNum !== null ? "font-mono text-4xl" : "font-sans text-lg md:text-2xl",
                      col.color,
                    )}
                  >
                    {col.valueStr}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {(lp || lr || lh) && (
            <p className="-mt-8 mb-10 text-center font-sans text-sm text-[var(--text-muted)]">
              Loading report data…
            </p>
          )}

          {/* Category cards */}
          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {/* Disease */}
            <div
              className="msc-card-lift rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-sm)]"
              style={{ borderTop: "3px solid var(--msc-primary)", animationDelay: "0ms" }}
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[var(--msc-primary-light)] text-[var(--msc-primary)]">
                  <i className="fas fa-stethoscope text-lg" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-[var(--text-heading)]">Disease Predictions</h3>
                  <p className="font-sans text-[13px] text-[var(--text-muted)]">Symptom-based AI insights</p>
                </div>
                <span className="rounded-[var(--radius-pill)] bg-[var(--msc-primary-light)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--msc-primary)]">
                  {predictions.length} Reports
                </span>
              </div>
              <ul className="divide-y divide-[var(--msc-border)]">
                {predSorted.slice(0, 3).map((p) => (
                  <li key={(p as { id: string }).id} className="flex gap-3 py-3 first:pt-0">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--msc-primary)]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-sm font-semibold text-[var(--text-heading)]">
                        {diseaseName(p as never)}
                      </p>
                      <p className="font-sans text-[11px] text-[var(--text-muted)]">{formatShort(parseDate((p as { createdAt?: string }).createdAt))}</p>
                    </div>
                    {(() => {
                      const cf = diseaseConfidence(p as never);
                      return cf ? (
                        <span className="h-fit shrink-0 rounded-[var(--radius-pill)] bg-[var(--msc-primary-light)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--msc-primary)]">
                          {cf} confidence
                        </span>
                      ) : (
                        <span className="h-fit shrink-0 rounded-[var(--radius-pill)] bg-[var(--bg-surface-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
                          —
                        </span>
                      );
                    })()}
                  </li>
                ))}
                {!predSorted.length && (
                  <li className="py-8 text-center font-sans text-sm text-[var(--text-muted)]">No disease reports yet.</li>
                )}
              </ul>
              <button type="button" className="mt-5 font-sans text-[13px] font-semibold text-[var(--msc-primary)] hover:underline group">
                View All Disease Reports
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>

            {/* Drug */}
            <div
              className="msc-card-lift rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-sm)]"
              style={{ borderTop: "3px solid var(--msc-accent-teal)", animationDelay: "90ms" }}
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[var(--msc-accent-teal-light)] text-[var(--msc-accent-teal)]">
                  <i className="fas fa-pills text-lg" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-[var(--text-heading)]">Drug Searches</h3>
                  <p className="font-sans text-[13px] text-[var(--text-muted)]">Alternative lookups</p>
                </div>
                <span className="rounded-[var(--radius-pill)] bg-[var(--msc-accent-teal-light)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--msc-accent-teal)]">
                  {drugs.length} Reports
                </span>
              </div>
              <ul className="divide-y divide-[var(--msc-border)]">
                {drugSorted.slice(0, 3).map((p) => {
                  const nm = String((p as { currentMedication?: string }).currentMedication || "—");
                  const nAlt = drugAltCount(p as never);
                  return (
                    <li key={(p as { id: string }).id} className="flex gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-sm font-bold text-[var(--text-heading)]">{nm}</p>
                        <p className="font-sans text-[12px] text-[var(--text-muted)]">
                          {nAlt ? `${nAlt} alternatives surfaced` : "Results from last run"}
                        </p>
                        <p className="mt-1 font-sans text-[11px] text-[var(--text-muted)]">
                          {formatShort(parseDate((p as { createdAt?: string }).createdAt))}
                        </p>
                      </div>
                      <span className="h-fit shrink-0 rounded-[var(--radius-pill)] bg-[var(--msc-accent-teal-light)] px-2 py-0.5 font-sans text-[10px] font-semibold text-[var(--msc-accent-teal)]">
                        Completed
                      </span>
                    </li>
                  );
                })}
                {!drugSorted.length && (
                  <li className="py-8 text-center font-sans text-sm text-[var(--text-muted)]">No drug searches yet.</li>
                )}
              </ul>
              <button type="button" className="mt-5 font-sans text-[13px] font-semibold text-[var(--msc-accent-teal)] hover:underline group">
                View All Drug Searches
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>

            {/* Heart */}
            <div
              className="msc-card-lift rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-sm)]"
              style={{ borderTop: "3px solid var(--msc-danger)", animationDelay: "180ms" }}
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[var(--msc-danger-light)] text-[var(--msc-danger)]">
                  <i className="fas fa-heart-pulse text-lg" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-[var(--text-heading)]">Heart Assessments</h3>
                  <p className="font-sans text-[13px] text-[var(--text-muted)]">Risk evaluations</p>
                </div>
                <span className="rounded-[var(--radius-pill)] bg-[var(--msc-danger-light)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--msc-danger)]">
                  {hearts.length} Reports
                </span>
              </div>
              <ul className="divide-y divide-[var(--msc-border)]">
                {heartSorted.slice(0, 3).map((p) => {
                  const ra = (p as { riskAssessment?: { level?: string; percentage?: number } }).riskAssessment;
                  const lvl = ra?.level || "Recorded";
                  const pct = typeof ra?.percentage === "number" ? ra.percentage : riskLevelStyle(lvl).pct;
                  const st = riskLevelStyle(lvl);
                  return (
                    <li key={(p as { id: string }).id} className="space-y-2 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className="rounded-[var(--radius-pill)] px-3 py-0.5 font-mono text-[10px] font-semibold uppercase"
                          style={{ backgroundColor: st.bg, color: st.fg }}
                        >
                          {lvl} Risk
                        </span>
                        <span className="font-sans text-[11px] text-[var(--text-muted)]">
                          {formatShort(parseDate((p as { createdAt?: string }).createdAt))}
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--msc-border)]">
                        <div
                          className="h-full rounded-[var(--radius-pill)] transition-[width] duration-700 ease-out"
                          style={{
                            width: `${Math.min(100, Math.max(0, pct))}%`,
                            backgroundColor: st.bar as string,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
                {!heartSorted.length && (
                  <li className="py-8 text-center font-sans text-sm text-[var(--text-muted)]">No heart reports yet.</li>
                )}
              </ul>
              <button type="button" className="mt-5 font-sans text-[13px] font-semibold text-[var(--msc-danger)] hover:underline group">
                View All Heart Reports
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          <style>{`
            @keyframes tl-in {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .tl-item { animation: tl-in 0.45s ease-out both; }
            @keyframes dot-pulse-once {
              0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.45); }
              100% { box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
            }
            .tl-dot-pulse { animation: dot-pulse-once 1.2s ease-out 0.3s both; }
            @keyframes msc-bar-rise {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
            .msc-bar-rise { transform-origin: bottom; animation: msc-bar-rise 0.6s ease-out both; }
          `}</style>

          {/* Timeline */}
          <section className="mb-12">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="font-display text-2xl font-bold text-[var(--text-heading)]">Complete Assessment History</h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <i className="fas fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
                  <input
                    type="search"
                    placeholder="Search assessments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-[var(--radius-pill)] border-[1.5px] border-[var(--msc-border)] py-2.5 pl-10 pr-4 font-sans text-sm text-[var(--text-body)] focus:border-[var(--msc-primary)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(37,99,235,0.12)] sm:w-64"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-[var(--radius-pill)] border-[1.5px] border-[var(--msc-border)] bg-[var(--bg-surface)] px-4 py-2.5 font-sans text-sm text-[var(--text-body)] focus:border-[var(--msc-primary)] focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Disease">Disease Prediction</option>
                  <option value="Drug">Drug Search</option>
                  <option value="Heart">Heart Risk</option>
                </select>
              </div>
            </div>

            <div className="relative pl-8 md:pl-[104px]">
              <div className="absolute bottom-4 left-[11px] top-4 w-[2px] rounded bg-[var(--msc-border)] md:left-[71px]" />
              {merged.length === 0 ? (
                <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--msc-border)] bg-[var(--bg-surface)] px-6 py-12 text-center font-sans text-[var(--text-muted)]">
                  No assessments in this range. Run a prediction or widen the filter.
                </p>
              ) : null}
              {merged.map((row, idx) => {
                const prev = idx > 0 ? merged[idx - 1] : null;
                const ym = `${row.sort.getFullYear()}-${row.sort.getMonth()}`;
                const prevYm = prev ? `${prev.sort.getFullYear()}-${prev.sort.getMonth()}` : null;
                const showMonthHeader = idx === 0 || ym !== prevYm;
                let dotClass = "";
                let borderColor = "var(--msc-primary)";
                let badgeCls = "";

                if (row.type === "Drug Search") {
                  borderColor = "var(--msc-accent-teal)";
                  badgeCls = "bg-[var(--msc-accent-teal-light)] text-[var(--msc-accent-teal)]";
                }
                if (row.type === "Heart Risk") {
                  borderColor = "var(--msc-danger)";
                  badgeCls = "bg-[var(--msc-danger-light)] text-[var(--msc-danger)]";
                }
                if (row.type === "Disease Prediction") badgeCls = "bg-[var(--msc-primary-light)] text-[var(--msc-primary)]";
                const isPulse = idx === 0 && row.sort.getTime() > 0;
                dotClass = cn(
                  "absolute left-[5px] z-[1] h-3 w-3 rounded-full border-[3px] border-white md:left-[66px]",
                  isPulse ? "tl-dot-pulse" : "",
                );

                let detailMid = "";
                let chips: string[] = [];

                if (row.type === "Disease Prediction") {
                  const raw = row.raw as { symptoms?: string[]; prediction?: unknown };
                  const dn = diseaseName(raw);
                  const conf = diseaseConfidence(raw);
                  const sn = raw.symptoms?.length ?? 0;
                  detailMid = `Predicted: ${dn}${conf ? ` — ${conf} confidence` : ""} — ${sn} symptoms analyzed`;
                  chips = [...(raw.symptoms?.slice(0, 3) || []).map((s) => s), ...(sn ? [`${sn} symptoms`] : [])].slice(
                    0,
                    4,
                  );
                }
                if (row.type === "Drug Search") {
                  const raw = row.raw as { currentMedication?: string; reason?: string };
                  const n = drugAltCount(raw as never);
                  detailMid = `Searched: ${raw.currentMedication || "—"} — ${n || "—"} alternatives — Reason: ${raw.reason || "—"}`;
                  chips = [raw.reason || ""].filter(Boolean);
                }
                if (row.type === "Heart Risk") {
                  const raw = row.raw as {
                    riskAssessment?: { level?: string; percentage?: number };
                    age?: number;
                    smoker?: boolean;
                    height?: number;
                    weight?: number;
                  };
                  const ra = raw.riskAssessment;
                  detailMid = `Risk Level: ${ra?.level || "—"} — Score: ${ra?.percentage ?? "—"}/100 — Age: ${raw.age ?? "—"}, ${raw.smoker ? "Smoker" : "Non-smoker"}`;
                  const h = Number(raw.height) || 0;
                  const w = Number(raw.weight) || 0;
                  const bmi = h && w ? (w / ((h / 100) * (h / 100))).toFixed(1) : "";
                  chips = [`Age: ${raw.age ?? ""}`, ...(bmi ? [`BMI: ${bmi}`] : []), raw.smoker ? "Smoker" : "Non-smoker"];
                }

                const monthDivider = row.sort.toLocaleDateString("en-US", { month: "long", year: "numeric" });

                return (
                  <div key={`${row.id}-${idx}`}>
                    {showMonthHeader ? (
                      <div className="-ml-8 mb-6 mt-10 flex items-center gap-4 font-sans text-[12px] font-medium tracking-[0.1em] text-[var(--text-muted)] first:mt-0 md:-ml-[104px]">
                        <span className="h-px flex-1 bg-[var(--msc-border)]" aria-hidden />
                        {monthDivider}
                        <span className="h-px flex-[2] bg-[var(--msc-border)]" aria-hidden />
                      </div>
                    ) : null}
                    <div className="tl-item relative pb-12" style={{ animationDelay: `${idx * 0.08}s` }}>
                      <span
                        style={{ backgroundColor: borderColor }}
                        className={dotClass}
                        aria-hidden
                      />

                      <div className="mb-6 hidden w-[72px] -translate-x-full pr-6 text-right font-mono text-[11px] text-[var(--text-muted)] md:absolute md:left-0 md:block md:-translate-x-full md:translate-y-1 md:pr-10">
                        {formatShort(row.sort)}
                      </div>

                      <article
                        className="msc-card-lift group relative rounded-[var(--radius-md)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-5 pl-6 shadow-[var(--shadow-sm)] hover:border-transparent hover:shadow-[var(--shadow-md)] md:border-l-[3px]"
                        style={{ borderLeftColor: borderColor }}
                      >
                        <div className="mb-4 flex flex-wrap items-start gap-3">
                          <span className={cn("rounded-[var(--radius-pill)] px-3 py-1 font-mono text-[10px] font-semibold uppercase", badgeCls)}>
                            {row.type}
                          </span>
                          <span className="font-display min-w-0 flex-1 text-base font-semibold text-[var(--text-heading)]">
                            {row.type === "Disease Prediction"
                              ? diseaseName(row.raw as never)
                              : row.type === "Drug Search"
                                ? (row.raw as { currentMedication?: string }).currentMedication
                                : `${(row.raw as { riskAssessment?: { level?: string } }).riskAssessment?.level || ""} cardiovascular outlook`}
                          </span>
                          <span className="ml-auto shrink-0 font-mono text-[11px] text-[var(--text-muted)]">{formatShort(row.sort)}</span>
                        </div>
                        <p className="font-sans text-[14px] leading-relaxed text-[var(--text-body)]">{detailMid}</p>
                        {chips.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {chips.map((c) =>
                              c ? (
                                <span
                                  key={c}
                                  className="rounded-[var(--radius-pill)] border border-[var(--msc-border)] bg-[var(--bg-surface-2)] px-2.5 py-1 font-sans text-[10px] text-[var(--text-body)]"
                                >
                                  {c}
                                </span>
                              ) : null,
                            )}
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className="mt-6 rounded-[var(--radius-sm)] border border-[var(--msc-border)] px-3 py-1.5 font-sans text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--msc-primary)] hover:text-[var(--msc-primary)] md:absolute md:right-5 md:top-5"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          View Details
                        </button>
                      </article>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Chart */}
          <section className="mb-14 rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]">
            <h3 className="font-display text-xl font-bold text-[var(--text-heading)]">Assessment Activity</h3>
            <p className="font-sans text-[13px] text-[var(--text-muted)]">Your check-in frequency over recent months.</p>

            <div className="mt-10 min-w-[300px] overflow-x-auto pb-4">
              <div className="flex h-[220px] gap-4 px-2">
                <div className="flex h-[180px] flex-col justify-between pb-8 font-mono text-[11px] text-[var(--text-muted)]">
                  {[6, 4, 2, 0].map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>
                <div className="relative flex flex-1 items-end pb-8">
                  <div className="absolute bottom-8 left-0 right-0 top-0 flex flex-col border-b border-l border-[var(--msc-border)]">
                    {(() => {
                      const mx = Math.max(...monthBuckets.map((b) => b.count), 1);
                      const avgN = mx > 0 ? Number(avgPerMonth) : 0;
                      const pct = mx ? Math.min(100, Math.max(0, (avgN / mx) * 100)) : 0;
                      return (
                        <div
                          className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[var(--msc-accent-teal)]"
                          style={{ bottom: `${pct}%` }}
                          title={`avg ${avgPerMonth}`}
                        >
                          <span className="absolute -right-1 -top-2 font-mono text-[10px] text-[var(--msc-accent-teal)]">
                            avg
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="relative z-[1] flex h-[180px] flex-1 items-end justify-around gap-2 px-2">
                    {monthBuckets.map((b, i) => (
                      <div key={b.key} className="relative flex h-full w-full max-w-[52px] flex-col justify-end">
                        {barHover === i ? (
                          <div className="absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-[var(--radius-pill)] bg-[var(--text-heading)] px-3 py-1 font-sans text-[11px] text-white shadow-md">
                            {b.count} — {b.label}
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className={cn("msc-bar-rise group flex w-full flex-col justify-end outline-none")}
                          style={{ animationDelay: `${i * 0.05}s` }}
                          onMouseEnter={() => setBarHover(i)}
                          onMouseLeave={() => setBarHover(null)}
                        >
                          <div
                            className="w-full min-h-[6px] rounded-t bg-gradient-to-t from-[var(--msc-primary)] to-[var(--msc-primary-hover)] transition-opacity group-hover:opacity-90"
                            style={{ height: `${Math.max(6, (b.hPct / 100) * 160)}px` }}
                          />
                        </button>
                        <span className="mt-2 text-center font-mono text-[10px] leading-tight text-[var(--text-muted)]">
                          {b.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Export */}
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[var(--msc-border)] bg-[var(--bg-surface-2)] px-4 py-10">
            {[
              ["fa-file-pdf", "Export as PDF"],
              ["fa-file-lines", "Export as CSV"],
              ["fa-print", "Print Report"],
            ].map(([icon, lab]) => (
              <button
                key={lab}
                type="button"
                onClick={() => lab.includes("Print") && window.print()}
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border-[1.5px] border-[var(--msc-border)] bg-[var(--bg-surface)] px-6 py-2.5 font-sans text-sm text-[var(--text-body)] transition-colors hover:border-[var(--msc-primary)] hover:bg-[var(--msc-primary-light)] hover:text-[var(--msc-primary)]"
              >
                <i className={`fas ${icon}`} aria-hidden />
                {lab}
              </button>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
