import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import FeaturesGrid from "@/components/features-grid";

export default function Dashboard() {
  return (
    <div className="msc-page-bg">
      <div className="msc-animate-page msc-inner flex min-h-screen flex-col">
        <Navbar />
        <Hero />
        <div className="msc-stagger-3 w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-[var(--msc-border)] border-y border-[var(--msc-border)] bg-[var(--bg-surface)] sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:rounded-[var(--radius-lg)] md:border md:border-[var(--msc-border)]">
            {[
              { n: "98.2%", l: "Accuracy", c: "text-[var(--msc-primary)]" },
              { n: "50,000+", l: "Assessments", c: "text-[var(--msc-primary)]" },
              { n: "15+", l: "Conditions Detected", c: "text-[var(--msc-primary)]" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col items-center justify-center px-6 py-6 text-center">
                <span className={`font-mono text-[28px] font-bold ${s.c}`}>{s.n}</span>
                <span className="mt-1 font-sans text-[13px] text-[var(--text-muted)]">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
        <FeaturesGrid />
        <Footer />
      </div>
    </div>
  );
}
